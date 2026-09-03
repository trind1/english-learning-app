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
    `(() => { const button = [...document.querySelectorAll('button')].find((item) => { const value = item.textContent.trim(); return item.getAttribute('aria-label') === ${text(label)} || value === ${text(label)} || value.endsWith(${text(label)}) || value.startsWith(${text(label)}); }); if (!button) return false; button.click(); return true; })()`,
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
    `(() => {
      const card = document.querySelector('.consistency-chart-card');
      const percentage = card?.querySelector('.consistency-percentage');
      const week = card?.querySelector('.consistency-week');
      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        mainVisible: Boolean(document.querySelector('main')?.getBoundingClientRect().height),
        consistency: card ? {
          left: Math.round(card.getBoundingClientRect().left),
          right: Math.round(card.getBoundingClientRect().right),
          percentageRight: Math.round(percentage.getBoundingClientRect().right),
          weekClientWidth: week.clientWidth,
          weekScrollWidth: week.scrollWidth,
        } : null,
      };
    })()`,
  );
  if (
    layout.scrollWidth > layout.width ||
    !layout.mainVisible ||
    (layout.consistency &&
      (layout.consistency.right > layout.width ||
        layout.consistency.percentageRight > layout.width))
  )
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

const measureNavigation = (selector) =>
  evaluate(`(() => {
    const navigation = document.querySelector(${text(selector)});
    const buttons = [...navigation.querySelectorAll('.side-nav-links > .side-nav-item > button')];
    return {
      labels: buttons.map((button) => button.querySelector('.side-nav-label').textContent),
      heights: buttons.map((button) => Math.round(button.getBoundingClientRect().height)),
      buttonLefts: buttons.map((button) => Math.round(button.getBoundingClientRect().left)),
      iconLefts: buttons.map((button) => Math.round(button.querySelector('.side-nav-icon').getBoundingClientRect().left)),
      labelLefts: buttons.map((button) => Math.round(button.querySelector('.side-nav-label').getBoundingClientRect().left)),
      iconSizes: buttons.map((button) => getComputedStyle(button.querySelector('.side-nav-icon')).width),
      labelSizes: buttons.map((button) => getComputedStyle(button).fontSize),
      iconMasks: buttons.map((button) => getComputedStyle(button.querySelector('.side-nav-icon')).webkitMaskImage),
      activeLabel: buttons.find((button) => button.getAttribute('aria-current') === 'page')?.querySelector('.side-nav-label').textContent ?? null,
      activeBackground: getComputedStyle(buttons.find((button) => button.getAttribute('aria-current') === 'page')).backgroundColor,
      activeAccentWidth: getComputedStyle(buttons.find((button) => button.getAttribute('aria-current') === 'page'), '::before').width,
      navigationRight: Math.round(navigation.getBoundingClientRect().right),
      viewportWidth: window.innerWidth,
    };
  })()`);

const assertNavigation = (measurement, expectedActive) => {
  if (
    JSON.stringify(measurement.labels) !==
      JSON.stringify(["Dashboard", "Vocabulary", "Practice", "Progress"]) ||
    measurement.heights.some((height) => height !== 52) ||
    measurement.iconSizes.some((size) => size !== "24px") ||
    measurement.labelSizes.some((size) => size !== "15px") ||
    measurement.iconMasks.some((mask) => mask === "none") ||
    measurement.labelLefts.some(
      (left, index) => left <= measurement.iconLefts[index],
    ) ||
    measurement.activeLabel !== expectedActive ||
    measurement.activeBackground === "rgba(0, 0, 0, 0)" ||
    measurement.activeAccentWidth !== "3px" ||
    measurement.navigationRight > measurement.viewportWidth
  )
    throw new Error(
      `Incorrect sidebar navigation: ${JSON.stringify(measurement)}`,
    );
};

const measureFolderDetail = () =>
  evaluate(`(() => {
    const page = document.querySelector('.folder-detail-page');
    const back = page.querySelector('.folder-back-button');
    const title = page.querySelector('.folder-detail-hero h1');
    const study = [...page.querySelectorAll('.study-mode-card')];
    const actions = [...page.querySelectorAll('.folder-action-button')];
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { left: Math.round(box.left), right: Math.round(box.right), top: Math.round(box.top), bottom: Math.round(box.bottom), width: Math.round(box.width), height: Math.round(box.height) };
    };
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      backLabel: back.textContent.trim().replace(/\\s+/g, ' '),
      back: rect(back),
      title: title.textContent.trim(),
      titleRect: rect(title),
      studyLabels: study.map((button) => button.getAttribute('aria-label')),
      studyRects: study.map(rect),
      actionLabels: actions.map((button) => button.textContent.trim().replace(/\\s+/g, ' ')),
      actionRects: actions.map(rect),
      focusOutline: getComputedStyle(back).outlineWidth,
    };
  })()`);

const assertFolderDetail = (measurement, folderName) => {
  const overlaps = (left, right) =>
    left.left < right.right &&
    left.right > right.left &&
    left.top < right.bottom &&
    left.bottom > right.top;
  const allRects = [...measurement.studyRects, ...measurement.actionRects];
  if (
    measurement.backLabel !== "← Back to Folders" ||
    measurement.backLabel.includes(folderName) ||
    measurement.back.width >= measurement.viewportWidth * 0.75 ||
    measurement.back.height < 42 ||
    measurement.title !== folderName ||
    measurement.titleRect.right > measurement.viewportWidth ||
    (measurement.viewportWidth >= 1000 &&
      Number.parseFloat(measurement.focusOutline) < 2) ||
    JSON.stringify(measurement.studyLabels) !==
      JSON.stringify(["Flashcards", "Multiple Choice", "AI Generator"]) ||
    JSON.stringify(measurement.actionLabels) !==
      JSON.stringify(["+ Add Vocabulary", "⇧ Import CSV"]) ||
    allRects.some(
      (rect) => rect.right > measurement.viewportWidth || rect.width < 120,
    ) ||
    allRects.some((rect, index) =>
      allRects.slice(index + 1).some((other) => overlaps(rect, other)),
    ) ||
    measurement.scrollWidth > measurement.viewportWidth
  )
    throw new Error(
      `Incorrect folder detail layout: ${JSON.stringify(measurement)}`,
    );
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
  try {
    await waitFor(hasText("Welcome back"), "dashboard");
  } catch (error) {
    const state = await evaluate(
      `({ url: location.href, body: document.body.innerText, alerts: [...document.querySelectorAll('[role=alert]')].map((item) => item.textContent) })`,
    );
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }
  let desktop = await capture("desktop", 1440, 900);
  let tablet = await capture("tablet", 768, 900);

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
  const emptyBackLabel = await evaluate(
    `document.querySelector('.folder-back-button')?.textContent.trim().replace(/\\s+/g, ' ')`,
  );
  if (
    emptyBackLabel !== "← Back to Folders" ||
    emptyBackLabel.includes(folderName)
  )
    throw new Error(`Incorrect back label: ${emptyBackLabel}`);
  await clickButton("Back to Folders");
  await waitFor(
    hasText("Your vocabulary topics"),
    "folders after back navigation",
  );
  await waitFor(
    `[...document.querySelectorAll('.folder-card')].some((item) => item.textContent.includes(${text(folderName)}))`,
    "folder card after back navigation",
  );
  await evaluate(
    `(() => { const card = [...document.querySelectorAll('.folder-card')].find((item) => item.textContent.includes(${text(folderName)})); card.querySelector('button').click(); return true; })()`,
  );
  await waitFor(hasText("No vocabulary yet."), "folder detail after reopening");
  await clickButton("Add Vocabulary");
  if ((await evaluate("document.activeElement?.id")) !== "word")
    throw new Error("Add Vocabulary action did not focus the add form.");

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
  await waitFor(
    `[...document.querySelectorAll('.folder-card')].some((item) => item.textContent.includes(${text(folderName)}))`,
    "persisted folder",
  );
  await evaluate(
    `(() => { const card = [...document.querySelectorAll('.folder-card')].find((item) => item.textContent.includes(${text(folderName)})); card.querySelector('button').click(); return true; })()`,
  );
  await waitFor(hasText("/həˈləʊ/"), "persisted IPA");

  await clickButton("Import CSV");
  if ((await evaluate("document.activeElement?.id")) !== "csv")
    throw new Error("Import CSV action did not focus the CSV input.");

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

  const folderDesktop = await capture("folder-detail-desktop", 1440, 1000);
  await evaluate(`document.querySelector('.folder-back-button').focus()`);
  const folderDesktopDetail = await measureFolderDetail();
  assertFolderDetail(folderDesktopDetail, folderName);
  const folderTablet = await capture("folder-detail-tablet", 768, 1000);
  const folderTabletDetail = await measureFolderDetail();
  assertFolderDetail(folderTabletDetail, folderName);
  const folderMobile = await capture("folder-detail-mobile", 390, 900);
  const folderMobileDetail = await measureFolderDetail();
  assertFolderDetail(folderMobileDetail, folderName);
  await capture("folder-detail-desktop", 1440, 1000);

  if (!(await clickButton("Pronounce hello")))
    throw new Error("Pronunciation control was unavailable.");

  await clickButton("Flashcards");
  await waitFor(hasText("Reveal meaning"), "flashcards");
  const flashcardsDesktop = await capture("flashcards-desktop", 1440, 900);
  const flashcardsTablet = await capture("flashcards-tablet", 768, 900);
  const flashcardsMobile = await capture("flashcards-mobile", 390, 800);
  await capture("flashcards-desktop", 1440, 900);
  await clickButton("Reveal meaning");
  await clickButton("Next");
  await clickButton("Previous");
  await clickButton("Shuffle");
  await clickButton("Restart");
  await evaluate(
    `[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Back to')).click()`,
  );
  await waitFor(hasText(folderName), "folder after flashcards");

  await clickButton("Multiple Choice");
  await waitFor(
    `Boolean(document.querySelector('section[aria-label="Multiple-choice test"]'))`,
    "quiz",
  );
  const quizDesktop = await capture("quiz-desktop", 1440, 900);
  const quizTablet = await capture("quiz-tablet", 768, 900);
  const quizMobile = await capture("quiz-mobile", 390, 800);
  await capture("quiz-desktop", 1440, 900);
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
  const quizResultsDesktop = await capture("quiz-results-desktop", 1440, 900);
  const quizResultsTablet = await capture("quiz-results-tablet", 768, 900);
  const quizResultsMobile = await capture("quiz-results-mobile", 390, 800);
  await capture("quiz-results-desktop", 1440, 900);
  await clickButton("Back to folder");
  await waitFor(hasText(folderName), "folder after quiz");

  await clickButton("AI Generator");
  await waitFor(
    `Boolean(document.querySelector('section[aria-label="AI text generation"]'))`,
    "AI generator",
  );
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
  await clickButton("Dashboard");
  await waitFor(hasText("Completed sessions"), "updated dashboard");
  const consistency = await evaluate(`(() => {
    const card = document.querySelector('.consistency-chart-card');
    const days = [...card.querySelectorAll('.consistency-day')];
    const elapsed = days.filter((day) => !day.classList.contains('consistency-day--upcoming'));
    const active = elapsed.filter((day) => day.classList.contains('consistency-day--active') || day.classList.contains('consistency-day--active-today'));
    const percentage = Number(card.querySelector('.consistency-percentage').textContent.replace('%', ''));
    return {
      percentage,
      expectedPercentage: Math.round((active.length / elapsed.length) * 1000) / 10,
      elapsedDays: elapsed.length,
      activeDays: active.length,
      upcomingDays: days.length - elapsed.length,
      todayDays: days.filter((day) => day.classList.contains('consistency-day--today')).length,
      labels: days.map((day) => day.getAttribute('aria-label')),
    };
  })()`);
  if (
    consistency.percentage !== consistency.expectedPercentage ||
    consistency.todayDays !== 1 ||
    consistency.labels.length !== 7
  )
    throw new Error(
      `Incorrect learning consistency: ${JSON.stringify(consistency)}`,
    );
  desktop = await capture("desktop", 1440, 900);
  const desktopNavigation = await measureNavigation(
    'nav[aria-label="Primary navigation"]',
  );
  assertNavigation(desktopNavigation, "Dashboard");
  const vocabularyPoint = await evaluate(`(() => {
    const button = [...document.querySelectorAll('nav[aria-label="Primary navigation"] .side-nav-item button')][1];
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, before: getComputedStyle(button).backgroundColor };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: vocabularyPoint.x,
    y: vocabularyPoint.y,
  });
  await delay(250);
  const hoverBackground = await evaluate(
    `getComputedStyle([...document.querySelectorAll('nav[aria-label="Primary navigation"] .side-nav-item button')][1]).backgroundColor`,
  );
  await evaluate(
    `[...document.querySelectorAll('nav[aria-label="Primary navigation"] .side-nav-item button')][1].focus()`,
  );
  const focusOutlineWidth = await evaluate(
    `getComputedStyle([...document.querySelectorAll('nav[aria-label="Primary navigation"] .side-nav-item button')][1]).outlineWidth`,
  );
  if (hoverBackground === vocabularyPoint.before || focusOutlineWidth !== "3px")
    throw new Error(
      `Sidebar interaction states failed: ${JSON.stringify({ hoverBackground, focusOutlineWidth })}`,
    );
  await clickButton("Vocabulary");
  await waitFor(
    `document.querySelector('nav[aria-label="Primary navigation"] [aria-current="page"]')?.textContent.includes('Vocabulary')`,
    "Vocabulary navigation active state",
  );
  await clickButton("Practice");
  await waitFor(
    `document.querySelector('nav[aria-label="Primary navigation"] [aria-current="page"]')?.textContent.includes('Practice')`,
    "Practice navigation active state",
  );
  const progressPath = await evaluate("location.pathname");
  await clickButton("Progress");
  if ((await evaluate("location.pathname")) !== progressPath)
    throw new Error("Progress placeholder navigation changed unexpectedly.");
  await clickButton("Dashboard");
  await waitFor(
    hasText("Completed sessions"),
    "dashboard after navigation checks",
  );
  tablet = await capture("tablet", 768, 900);
  await evaluate(
    `document.querySelector('[aria-label="Open navigation"]').click()`,
  );
  await waitFor(
    `Boolean(document.querySelector('nav[aria-label="Mobile navigation"]'))`,
    "tablet navigation drawer",
  );
  const tabletNavigation = await measureNavigation(
    'nav[aria-label="Mobile navigation"]',
  );
  assertNavigation(tabletNavigation, "Dashboard");
  const sidebarTablet = await capture("sidebar-tablet", 768, 900);
  await evaluate(
    `document.querySelector('[data-testid="mobile-navigation-backdrop"]').click()`,
  );
  const mobile = await capture("mobile", 390, 800);
  await evaluate(
    `document.querySelector('[aria-label="Open navigation"]').click()`,
  );
  await waitFor(
    `Boolean(document.querySelector('nav[aria-label="Mobile navigation"]'))`,
    "mobile navigation drawer",
  );
  const mobileNavigation = await measureNavigation(
    'nav[aria-label="Mobile navigation"]',
  );
  assertNavigation(mobileNavigation, "Dashboard");
  const sidebarMobile = await capture("sidebar-mobile", 390, 800);

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
        flashcardsViewports: {
          desktop: flashcardsDesktop,
          tablet: flashcardsTablet,
          mobile: flashcardsMobile,
        },
        quizViewports: {
          desktop: quizDesktop,
          tablet: quizTablet,
          mobile: quizMobile,
          resultsDesktop: quizResultsDesktop,
          resultsTablet: quizResultsTablet,
          resultsMobile: quizResultsMobile,
        },
        folderDetail: {
          desktop: { capture: folderDesktop, detail: folderDesktopDetail },
          tablet: { capture: folderTablet, detail: folderTabletDetail },
          mobile: { capture: folderMobile, detail: folderMobileDetail },
        },
        dashboard: true,
        consistency,
        desktop,
        tablet,
        mobile,
        navigation: {
          desktop: desktopNavigation,
          hoverBackground,
          focusOutlineWidth,
          tablet: tabletNavigation,
          mobile: mobileNavigation,
          sidebarTablet,
          sidebarMobile,
        },
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
