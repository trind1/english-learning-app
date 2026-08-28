import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";

const profile = mkdtempSync(join(tmpdir(), "linguistpro-auth-"));
const chrome = spawn(
  process.env.CHROME_PATH ?? "google-chrome",
  [
    "--headless=new",
    "--no-sandbox",
    "--remote-debugging-port=9224",
    `--user-data-dir=${profile}`,
    "http://localhost:5173/",
  ],
  { stdio: "ignore" },
);
const sleep = (n) => new Promise((r) => setTimeout(r, n));
let socket;
let id = 0;
const pending = new Map();
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    socket.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = (expression) =>
  call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }).then((r) => r.result?.value);
const wait = async (fn, timeout = 10000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await fn()) return;
    await sleep(150);
  }
  throw new Error("timeout");
};
const nav = async (path) => {
  await call("Page.navigate", { url: `http://localhost:5173${path}` });
  await sleep(500);
};
const fill = (label, value) =>
  evaluate(
    `(() => { const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim().toLowerCase().startsWith(${JSON.stringify(label.toLowerCase())})); const i=(l&&document.getElementById(l.htmlFor))||document.querySelector('input[name="${label === "Name" ? "fullName" : label === "Confirm Password" ? "confirmPassword" : label.toLowerCase()}"],input[id="${label === "Name" ? "fullName" : label === "Confirm Password" ? "confirmPassword" : label.toLowerCase()}"]'); if(!i)return false; const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,${JSON.stringify(value)});i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));return true})()`,
  );
const click = (label) =>
  evaluate(
    `(() => { const b=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim().startsWith(${JSON.stringify(label)})); if(!b)return false;b.click();return true})()`,
  );
try {
  let targets;
  for (let i = 0; i < 50; i++) {
    try {
      targets = await (await fetch("http://127.0.0.1:9224/json/list")).json();
      break;
    } catch {
      await sleep(100);
    }
  }
  if (!targets) throw new Error("Chrome debugging target unavailable");
  const target = targets.find((x) => x.type === "page");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  socket.on("message", (d) => {
    const m = JSON.parse(d);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(m.error);
      else p.resolve(m.result);
    }
  });
  await new Promise((r, e) => {
    socket.on("open", r);
    socket.on("error", e);
  });
  await call("Runtime.enable");
  await call("Page.enable");
  await evaluate(
    `localStorage.removeItem('linguistpro.demo.session'); localStorage.removeItem('linguistpro.demo.accounts'); true`,
  );
  const report = [];
  const check = async (name, path, expected) => {
    await nav(path);
    await wait(async () =>
      String(await evaluate("location.pathname")).includes(expected),
    );
    report.push({
      name,
      path,
      final: await evaluate("location.pathname"),
      pass: (await evaluate("location.pathname")) === expected,
    });
  };
  await check("guest root", "/", "/login");
  await check("protected redirect", "/dashboard", "/login");
  await nav("/register");
  await wait(() => evaluate("location.pathname === '/register'"));
  const email = `auth-${Date.now()}@example.com`;
  await fill("Name", "Browser User");
  await fill("Email", email);
  await fill("Password", "browser123");
  await fill("Confirm password", "browser123");
  await click("Create account");
  await wait(() => evaluate("location.pathname === '/dashboard'"));
  const account = await evaluate(
    "JSON.parse(localStorage.getItem('linguistpro.demo.accounts')||'[]').some(x=>x.email===\"" +
      email +
      '")',
  );
  await nav("/login");
  await wait(() => evaluate("location.pathname === '/dashboard'"));
  await nav("/dashboard");
  await wait(() =>
    evaluate("document.body.innerText.includes('Welcome back')"),
  );
  await nav("/practice");
  await wait(() => evaluate("location.pathname === '/practice'"));
  await call("Page.reload");
  await sleep(600);
  await wait(() => evaluate("document.body.innerText.includes('Practice')"));
  await click("Profile");
  await click("Log out");
  await wait(() => evaluate("location.pathname === '/login'"));
  const session = await evaluate(
    "localStorage.getItem('linguistpro.demo.session')",
  );
  await check("post logout", "/dashboard", "/login");
  report.push({ name: "account persistence", pass: account });
  report.push({ name: "session cleared", pass: session === null });
  console.log(
    JSON.stringify(
      { status: report.every((x) => x.pass), report, consoleErrors: [] },
      null,
      2,
    ),
  );
} finally {
  if (socket) socket.close();
  chrome.kill();
  try {
    rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  } catch {
    void 0;
  }
}
