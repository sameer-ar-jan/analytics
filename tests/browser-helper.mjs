import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

export async function browserSmoke({ base, token, chromePath, screenshotPath }) {
  const profile = await mkdtemp(join(tmpdir(), "analytics-browser-"));
  const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-sandbox", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let chromeOutput = "";
  chrome.stderr.on("data", (data) => { chromeOutput += data; });
  let socket;
  try {
    let port;
    for (let attempt = 0; attempt < 100; attempt++) {
      const endpoint = chromeOutput.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
      if (endpoint) { port = Number(endpoint[1]); break; }
      try { port = Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); break; } catch { await delay(100); }
    }
    assert.ok(port, `Chrome debugging endpoint did not start: ${chromeOutput}`);
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
    await once(socket, "open");
    let id = 0;
    const pending = new Map();
    const errors = [];
    const consoleErrors = [];
    let downloaded = false;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const handler = pending.get(message.id);
        pending.delete(message.id);
        if (handler) message.error ? handler.reject(new Error(JSON.stringify(message.error))) : handler.resolve(message.result);
      }
      if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") consoleErrors.push(message.params.args.map(arg => arg.description || arg.value).join(" "));
      if (["Page.downloadWillBegin", "Browser.downloadWillBegin"].includes(message.method)) downloaded = true;
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    const evaluate = async (expression) => {
      const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };
    const waitFor = async (expression) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(`Boolean(${expression})`)) return;
        if (errors.length) throw new Error(errors.join("\n"));
        await delay(100);
      }
      throw new Error(`Browser condition timed out: ${expression}\n${await evaluate('JSON.stringify({url: location.href, title: document.title, body: document.body.innerText.slice(0, 1000)})')}\n${consoleErrors.join("\n")}`);
    };
    const checkReportPopups = async () => {
      for (const title of ["New vs DAU", "Revenue vs Total Spend"]) {
        await evaluate(`document.querySelector('table button[aria-label="${title}"]').click()`);
        const popup = `Array.from(document.querySelectorAll('h3')).find(heading => heading.textContent.trim() === ${JSON.stringify(title)})?.parentElement.parentElement`;
        await waitFor(`${popup}?.querySelector('canvas')`);
        const geometry = await evaluate(`(() => {
          const popup = ${popup};
          const rect = popup.getBoundingClientRect();
          return { position: getComputedStyle(popup).position, top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        })()`);
        assert.equal(geometry.position, "fixed", `${title} must float over the report`);
        assert.ok(geometry.top >= 0 && geometry.top < 1000 && geometry.width > 300 && geometry.height > 300, JSON.stringify(geometry));
        await evaluate(`(${popup}).querySelector('[data-testid="CloseIcon"]').closest('button').click()`);
        await waitFor(`!(${popup})`);
      }
    };
    const checkGameTabs = async () => {
      await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Graphs').click()`);
      await waitFor(`document.querySelector('[role="tabpanel"] canvas')`);
      for (const index of [0, 1]) {
        await evaluate(`document.querySelector('[role="tablist"]')?.querySelectorAll('[role="tab"]')[${index}]?.click()`);
        await waitFor(`document.querySelector('[role="tabpanel"] canvas')`);
        const failures = await evaluate(`Array.from(document.querySelectorAll('[role="tabpanel"]')).flatMap(panel => {
          if (panel.hidden) return getComputedStyle(panel).display === 'none' ? [] : ['Hidden panel occupies space'];
          const bounds = panel.getBoundingClientRect();
          return Array.from(panel.querySelectorAll('canvas')).flatMap(canvas => {
            const chart = canvas.getBoundingClientRect();
            return chart.left >= bounds.left - 1 && chart.right <= bounds.right + 1 ? [] : ['Chart extends outside tab panel'];
          });
        })`);
        assert.deepEqual(failures, [], 'game charts stay inside selected tab panels');
      }
      // Exercise the Events panel shown in the report and its expanded modal.
      await call('Emulation.setDeviceMetricsOverride', { width: 908, height: 900, deviceScaleFactor: 1, mobile: false });
      const checkEvents = async (scope) => {
        for (const label of ['INT', 'RV', 'OOM', 'BOR', 'purchase', 'Ad Impression']) {
          const root = `Array.from(${scope}.querySelectorAll('[role="tablist"]')).find(list => Array.from(list.querySelectorAll('[role="tab"]')).some(tab => tab.textContent === 'Ad Impression'))?.closest('header').parentElement`;
          await waitFor(root);
          await evaluate(`Array.from((${root}).querySelectorAll('[role="tab"]')).find(tab => tab.textContent === ${JSON.stringify(label)}).click()`);
          await waitFor(`(${root}).querySelector('[role="tabpanel"]:not([hidden]) canvas')`);
          const contained = await evaluate(`(() => {
            const root = ${root};
            const header = root.querySelector('header').getBoundingClientRect();
            const panel = root.querySelector('[role="tabpanel"]:not([hidden])').getBoundingClientRect();
            const chart = root.querySelector('[role="tabpanel"]:not([hidden]) canvas').getBoundingClientRect();
            return panel.top >= header.bottom - 1 && chart.left >= panel.left - 1 && chart.right <= panel.right + 1;
          })()`);
          assert.ok(contained, `${label}: event chart must appear below Geo/Experiments, inside its selected panel`);
        }
      };
      await checkEvents('document');
      await evaluate(`Array.from(document.querySelectorAll('h3')).find(heading => heading.textContent.trim() === 'Events').parentElement.querySelector('button').click()`);
      await waitFor(`document.querySelector('[role="presentation"] .MuiModal-backdrop')`);
      await checkEvents(`document.querySelector('.MuiModal-root')`);
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await waitFor(`!document.querySelector('.MuiModal-root')`);
      await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
      // Other report routes restore this shared preference on mount.
      await evaluate(`localStorage.setItem('showGraph', 'false')`);
    };
    await call("Runtime.enable");
    await call("Page.enable");
    await call("Network.enable");
    await call("Network.setCookie", { name: "analytics_session", value: token, url: base, httpOnly: true, sameSite: "Lax" });
    await call("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: profile, eventsEnabled: true });
    await call("Page.navigate", { url: `${base}/dashboard` });
    await waitFor(`document.querySelector('a[href="/overall"]') && document.querySelector('table')`);
    // Let hydration complete, then check native client-side route changes.
    await delay(700);
    await checkReportPopups();
    await checkGameTabs();
    await evaluate(`document.querySelector('a[href="/dashboardbuilder"]').click()`);
    await waitFor(`location.pathname === "/dashboardbuilder" && document.querySelector('svg[role="img"] path')`);
    await evaluate(`document.querySelector('details summary').click()`);
    await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Expand').click()`);
    await waitFor('document.querySelector(\'[role="dialog"] svg[role="img"] path\')');
    await evaluate(`document.querySelector('[role="dialog"] button').click()`);
    await waitFor('!document.querySelector(\'[role="dialog"]\')');
    await evaluate(`document.querySelector('a[href="/dashboard"]').click()`);
    await waitFor('location.pathname === "/dashboard" && document.querySelector(\'a[href="/overall"]\')');
    await evaluate(`document.querySelector('a[href="/overall"]').click()`);
    await waitFor('location.pathname === "/overall" && document.title.includes("Overall") && document.querySelector("table")');
    await checkReportPopups();
    await evaluate(`document.querySelector('a[href*="game=2248"]').click()`);
    await waitFor('location.pathname === "/dashboard" && location.search.includes("game=2248") && document.querySelector("table")');
    await checkReportPopups();
    await checkGameTabs();
    await evaluate(`document.querySelector('a[href="/campwise"]').click()`);
    await waitFor('location.pathname === "/campwise" && document.title.includes("Campaigns") && document.querySelector("table")');
    await evaluate(`document.querySelector('a[href="/roas2y"]').click()`);
    await waitFor('location.pathname === "/roas2y" && document.querySelector("select")');
    await call("Page.reload");
    await waitFor('location.pathname === "/roas2y" && document.querySelector("select")');
    await delay(1000);
    await evaluate(`window.__exportErrors = []; window.addEventListener('unhandledrejection', event => window.__exportErrors.push(String(event.reason)));`);
    await evaluate(`document.querySelector('button[data-testid="export-report"]').click()`);
    for (let attempt = 0; attempt < 100 && !downloaded; attempt++) {
      downloaded = (await readdir(profile)).some((file) => file.endsWith(".xlsx"));
      if (!downloaded) await delay(100);
    }
    const exportErrors = await evaluate('window.__exportErrors');
    assert.ok(downloaded, `Excel export did not start: ${errors.join("; ")}; ${JSON.stringify(exportErrors)}`);
    if (screenshotPath) {
      const { data } = await call("Page.captureScreenshot", { format: "png" });
      const { writeFile } = await import("node:fs/promises");
      await writeFile(screenshotPath, Buffer.from(data, "base64"));
    }
    assert.deepEqual(errors, [], "browser runtime errors");
    await evaluate(`document.querySelector('button[data-testid="sign-out"]').click()`);
    await waitFor('location.pathname === "/login" && document.body.innerText.includes("Sign in to your dashboard")');
    const sessionStatus = await evaluate('fetch("/api/auth/session").then(response => response.status)');
    assert.equal(sessionStatus, 401);
  } finally {
    socket?.close();
    chrome.kill("SIGTERM");
  }
}
