#!/usr/bin/env node
/**
 * ui-snap — screenshot FinanceOps routes with headless Chrome via the DevTools protocol.
 * No dependencies (Node ≥ 22: global fetch + WebSocket).
 *
 *   node scripts/ui-snap.mjs --routes /,/budgets --theme both --width 1440,390 --ai closed,open
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"]);
    return acc;
  }, []),
);
const list = (v, d) => (v ?? d).split(",").map((s) => s.trim()).filter(Boolean);

const URL_BASE = args.url ?? "http://localhost:4173";
// Git Bash on Windows rewrites a lone "/" into "C:/Program Files/Git/" — undo that, and accept "overview" for "/".
const normaliseRoute = (r) => {
  const unMsys = /^[A-Za-z]:[\\/]/.test(r) ? r.replace(/\\/g, "/").replace(/^[A-Za-z]:\/.*?\/Git/i, "") : r;
  const route = unMsys === "" || unMsys === "overview" ? "/" : unMsys;
  return route.startsWith("/") ? route : `/${route}`;
};
const ROUTES = list(args.routes, "/").map(normaliseRoute);
const THEMES = args.theme === "both" ? ["light", "dark"] : [args.theme ?? "light"];
const WIDTHS = list(args.width, "1440").map(Number);
const HEIGHT = Number(args.height ?? 1000);
const AI = list(args.ai, "closed");
const FULL = args.full === "true";
const OUT = args.out ?? ".snaps";

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const CHROME = candidates.find((p) => existsSync(p));
if (!CHROME) {
  console.error("No Chrome/Edge found. Set CHROME_PATH.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "ui-snap-"));
const PORT = 9300 + Math.floor((process.pid % 600));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 60 && !targets; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  } catch {
    await sleep(200);
  }
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = (expression) => send("Runtime.evaluate", { expression, returnByValue: true });

await send("Page.enable");
const written = [];
try {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      for (const ai of AI) {
        await send("Emulation.setDeviceMetricsOverride", { width, height: HEIGHT, deviceScaleFactor: 1, mobile: width < 640 });
        await send("Page.navigate", { url: URL_BASE + "/" });
        await sleep(600);
        await evaluate(`localStorage.setItem('fo-theme', ${JSON.stringify(theme)}); localStorage.setItem('fo-ai-open', ${JSON.stringify(ai === "open" ? "1" : "0")})`);
        for (const route of ROUTES) {
          await send("Page.navigate", { url: URL_BASE + route });
          await sleep(1200);
          if (FULL) {
            // Grow the viewport to the page height, then capture the viewport as-is.
            const res = await evaluate(`document.documentElement.scrollHeight`);
            const h = Math.min(Number(res.result?.result?.value) || HEIGHT, 8000);
            await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 1, mobile: width < 640 });
            await sleep(500);
          }
          const shot = await send("Page.captureScreenshot", { format: "png" });
          if (!shot.result?.data) throw new Error(`Screenshot failed for ${route}: ${JSON.stringify(shot.error ?? shot)}`);
          const name = `${route === "/" ? "overview" : route.replace(/^\//, "").replace(/\//g, "-")}_${theme}_${width}${ai === "open" ? "_ai" : ""}.png`;
          writeFileSync(join(OUT, name), Buffer.from(shot.result.data, "base64"));
          written.push(join(OUT, name));
          if (FULL) await send("Emulation.setDeviceMetricsOverride", { width, height: HEIGHT, deviceScaleFactor: 1, mobile: width < 640 });
        }
      }
    }
  }
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* Chrome may still hold files briefly */
  }
}
console.log(written.join("\n"));
