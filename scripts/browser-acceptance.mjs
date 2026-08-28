import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";

const appUrl = process.argv[2] ?? "http://localhost:5173";
const chromePath =
  process.env.CHROME_PATH ??
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "google-chrome");
const profile = mkdtempSync(join(tmpdir(), "english-learning-browser-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=9222",
    `--user-data-dir=${profile}`,
    appUrl,
  ],
  { stdio: "ignore", windowsHide: true },
);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const poll = async (operation, description, timeout = 15000) => {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeout) {
    try {
      const value = await operation();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(
    `${description} timed out${lastError ? `: ${lastError.message}` : ""}`,
  );
};

let socket;
let nextId = 0;
const pending = new Map();
const browserErrors = [];

const connect = async () => {
  const target = await poll(async () => {
    const response = await fetch("http://127.0.0.1:9222/json/list");
    const targets = await response.json();
    return targets.find((candidate) => candidate.type === "page");
  }, "Chrome debugging target");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown")
      browserErrors.push(message.params.exceptionDetails.text);
    if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error"
    )
      browserErrors.push(
        message.params.args
          .map((argument) => argument.value ?? argument.description)
          .join(" "),
      );
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails)
    throw new Error(
      response.exceptionDetails.exception?.description ??
        "Browser evaluation failed.",
    );
  return response.result.value;
};

const waitFor = (expression, description) =>
  poll(() => evaluate(expression), description);

const text = (value) => JSON.stringify(value);
const hasText = (value) =>
  `[...document.querySelectorAll('body *')].some((element) => element.children.length === 0 && element.textContent.includes(${text(value)}))`;
const clickButton = (label) =>
  evaluate(
    `(() => { const button = [...document.querySelectorAll('button')].find((item) => { const value = item.textContent.trim(); return value === ${text(label)} || value.endsWith(${text(label)}) || value.startsWith(${text(label)}); }); if (!button) return false; button.click(); return true; })()`,
  );
const fill = (label, value) =>
  evaluate(
    `(() => { const label = [...document.querySelectorAll('label')].find((item) => item.textContent.trim().startsWith(${text(label)})); const input = label && document.getElementById(label.htmlFor); if (!input) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, ${text(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`,
  );

const capture = async (name, width, height) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 480,
  });
  const layout = await evaluate(
    `({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, mainVisible: Boolean(document.querySelector('main')?.getBoundingClientRect().height) })`,
  );
  if (layout.scrollWidth > layout.width || !layout.mainVisible)
    throw new Error(`Broken ${name} layout: ${JSON.stringify(layout)}`);
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await mkdir("docs/sdd/evidence", { recursive: true });
  await writeFile(
    `docs/sdd/evidence/browser-${name}.png`,
    Buffer.from(screenshot.data, "base64"),
  );
  return layout;
};

try {
  await connect();
  await send("Runtime.enable");
  await send("Page.enable");
  await send("DOM.enable");
  await send("Page.navigate", { url: appUrl });
  await delay(500);
  // Seed the local demo session for the authenticated learning-flow portion.
  // Authentication lifecycle is verified separately before this flow.
  await evaluate(`(() => {
    localStorage.setItem("linguistpro.demo.accounts", JSON.stringify([{ id: "browser-user", name: "Browser User", email: "browser@example.com", password: "browser123" }]));
    localStorage.setItem("linguistpro.demo.session", JSON.stringify({ id: "browser-user", name: "Browser User", email: "browser@example.com" }));
    history.replaceState({}, "", "/dashboard");
    location.reload();
    return true;
  })()`);
  await waitFor(hasText("Welcome back"), "dashboard");
  const desktop = await capture("desktop", 1440, 900);
  const tablet = await capture("tablet", 768, 900);

  if (!(await clickButton("Library"))) await clickButton("Vocabulary");
  await waitFor(hasText("Your vocabulary topics"), "library");
  const folderName = `Browser Acceptance ${Date.now()}`;
  if (!(await fill("Folder name", folderName)))
    throw new Error("Folder name input was unavailable.");
  await clickButton("Create folder");
  try {
    await waitFor(hasText(folderName), "created folder");
  } catch (error) {
    const state = await evaluate(
      `({ input: document.getElementById('folder-name')?.value, alerts: [...document.querySelectorAll('[role=alert]')].map((item) => item.textContent), body: document.body.innerText })`,
    );
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }
  await evaluate(
    `(() => { const card = [...document.querySelectorAll('li')].find((item) => item.textContent.includes(${text(folderName)})); card.querySelector('button').click(); return true; })()`,
  );
  await waitFor(hasText("No vocabulary yet."), "folder detail");

  const vocabulary = [
    ["hello", "greeting", "/həˈləʊ/"],
    ["world", "earth", "/wɜːld/"],
    ["journey", "trip", "/ˈdʒɜːni/"],
    ["road", "way", "/rəʊd/"],
  ];
  for (const [word, meaning, ipa] of vocabulary) {
    await fill("Word", word);
    await fill("Meaning", meaning);
    await fill("IPA", ipa);
    await clickButton("Add vocabulary");
    await waitFor(hasText(ipa), `saved vocabulary ${word}`);
  }

  await send("Page.reload", { ignoreCache: true });
  await delay(500);
  if (!(await clickButton("Library"))) await clickButton("Vocabulary");
  await waitFor(hasText(folderName), "persisted folder");
  await evaluate(
    `(() => { const card = [...document.querySelectorAll('li')].find((item) => item.textContent.includes(${text(folderName)})); card.querySelector('button').click(); return true; })()`,
  );
  await waitFor(hasText("/həˈləʊ/"), "persisted IPA");

  const csvPath = join(profile, "browser.csv");
  await writeFile(
    csvPath,
    "word,meaning,ipa\nplane,aircraft,/pleɪn/\nhello,duplicate,\n",
  );
  const documentNode = await send("DOM.getDocument", { depth: -1 });
  const inputNode = await send("DOM.querySelector", {
    nodeId: documentNode.root.nodeId,
    selector: "input[type=file]",
  });
  if (!inputNode.nodeId) throw new Error("CSV file input was unavailable.");
  await send("DOM.setFileInputFiles", {
    nodeId: inputNode.nodeId,
    files: [csvPath],
  });
  await clickButton("Import");
  try {
    await waitFor(hasText("Imported: 1"), "CSV import report");
  } catch (error) {
    const state = await evaluate(
      `({ file: document.querySelector('input[type=file]')?.files?.[0]?.name, busy: [...document.querySelectorAll('button')].find((button) => button.textContent.includes('Import'))?.textContent, alerts: [...document.querySelectorAll('[role=alert]')].map((item) => item.textContent), body: document.body.innerText })`,
    );
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }
  await waitFor(hasText("Skipped: 1"), "CSV duplicate report");

  if (!(await clickButton("Pronounce hello")))
    throw new Error("Pronunciation control was unavailable.");
  const firstCheckbox = await evaluate(
    `(() => { const input = document.querySelector('section[aria-label="AI text generation"] input[type=checkbox]'); input.click(); return true; })()`,
  );
  if (!firstCheckbox)
    throw new Error("AI vocabulary selection was unavailable.");
  await clickButton("Generate text");
  try {
    await waitFor(
      `Boolean(document.querySelector('output[aria-label="Generated text"]'))`,
      "AI text",
    );
  } catch (error) {
    const state = await evaluate(
      `({ alerts: [...document.querySelectorAll('[role=alert]')].map((item) => item.textContent), buttons: [...document.querySelectorAll('button')].filter((button) => button.textContent.includes('Generat')).map((button) => button.textContent), body: document.body.innerText })`,
    );
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }

  await clickButton("Flashcards");
  await waitFor(hasText("Reveal meaning"), "flashcards");
  await clickButton("Reveal meaning");
  await clickButton("Next");
  await clickButton("Previous");
  await clickButton("Shuffle");
  await clickButton("Restart");
  await evaluate(
    `[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Back to')).click()`,
  );
  await waitFor(hasText(folderName), "folder after flashcards");

  await clickButton("Quiz");
  await waitFor(
    `Boolean(document.querySelector('section[aria-label="Multiple-choice test"]'))`,
    "quiz",
  );
  for (let question = 0; question < 10; question += 1) {
    const finished = await evaluate(
      `Boolean(document.querySelector('section[aria-label="Test results"]'))`,
    );
    if (finished) break;
    await evaluate(
      `(() => { const section = document.querySelector('section[aria-label="Multiple-choice test"]'); const choice = [...section.querySelectorAll('button')].find((button) => button.textContent !== 'Submit answer'); choice.click(); return true; })()`,
    );
    await clickButton("Submit answer");
    await delay(100);
  }
  try {
    await waitFor(
      `Boolean(document.querySelector('section[aria-label="Test results"]'))`,
      "quiz results",
    );
  } catch (error) {
    const state = await evaluate(
      `({ body: document.body.innerText, buttons: [...document.querySelectorAll('section[aria-label="Multiple-choice test"] button')].map((button) => ({ text: button.textContent, disabled: button.disabled })) })`,
    );
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }
  await clickButton("Dashboard");
  await waitFor(hasText("Completed sessions"), "updated dashboard");
  const mobile = await capture("mobile", 390, 800);

  if (browserErrors.length)
    throw new Error(`Browser errors: ${browserErrors.join(" | ")}`);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        url: appUrl,
        folderName,
        persistence: true,
        csv: true,
        pronunciation: true,
        ai: true,
        flashcards: true,
        quiz: true,
        dashboard: true,
        desktop,
        tablet,
        mobile,
        browserErrors: 0,
      },
      null,
      2,
    ),
  );
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  chrome.kill();
  if (chrome.exitCode === null)
    await Promise.race([
      new Promise((resolve) => chrome.once("exit", resolve)),
      delay(2000),
    ]);
  try {
    rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  } catch {
    // Chrome can briefly retain profile files on Windows after its process exits.
  }
}
