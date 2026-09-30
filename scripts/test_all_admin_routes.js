const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function auditAdminRoutes() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-audit-"));
  console.log("[AUDIT] Starting Chrome for admin route auditing...");

  const chrome = spawn("/usr/bin/google-chrome", [
    "--headless=new",
    "--remote-debugging-port=9230",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900",
    "--user-data-dir=" + tmpDir,
    "http://localhost:9000/app/login"
  ]);

  await sleep(3000);

  const errors = [];
  const routeResults = [];

  try {
    const res = await fetch("http://127.0.0.1:9230/json/list");
    const targets = await res.json();
    const target = targets.find(t => t.type === "page");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.method === "Runtime.exceptionThrown") {
        const text = d.params.exceptionDetails?.exception?.description || d.params.exceptionDetails?.text || "Unknown exception";
        errors.push({ type: "EXCEPTION", text, url: d.params.exceptionDetails?.url });
        console.error("[AUDIT EXCEPTION]", text.slice(0, 150));
      }
      if (d.method === "Network.responseReceived") {
        if (d.params.response.status >= 400 && !d.params.response.url.includes("/static/")) {
          errors.push({ type: "HTTP_ERR", status: d.params.response.status, url: d.params.response.url });
          console.warn(`[AUDIT HTTP ${d.params.response.status}]`, d.params.response.url);
        }
      }
      if (d.id && callbacks.has(d.id)) {
        const { resolve, reject } = callbacks.get(d.id);
        callbacks.delete(d.id);
        if (d.error) reject(d.error);
        else resolve(d.result);
      }
    };

    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send("Network.enable");
    await send("Page.enable");
    await send("Runtime.enable");

    // Wait for login page
    await sleep(2000);

    console.log("[AUDIT] Authenticating via SDK login API...");
    await send("Runtime.evaluate", {
      expression: `(async () => {
        try {
          const res = await fetch('/auth/user/emailpass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: 'dev-tester@peptech.bio', password: 'Peptech123!' })
          });
          const d = await res.json();
          if (d.token) {
            document.cookie = "_medusa_jwt=" + d.token + "; path=/; max-age=86400";
            localStorage.setItem("_medusa_jwt", d.token);
            localStorage.setItem("medusa_auth_token", d.token);
          }
          return d;
        } catch (e) {
          return { error: e.message };
        }
      })()`,
      awaitPromise: true
    });

    const routesToTest = [
      "/app/orders",
      "/app/orders/order_01H1016DEMO",
      "/app/products",
      "/app/categories",
      "/app/collections",
      "/app/inventory",
      "/app/customers",
      "/app/promotions",
      "/app/price-lists",
      "/app/commerce",
      "/app/subscriptions",
      "/app/settings",
      "/app/settings/locations/packaging-profiles"
    ];

    for (const route of routesToTest) {
      console.log(`\n[AUDIT] Navigating to http://localhost:9000${route}...`);
      const routeErrorsBefore = errors.length;
      await send("Page.navigate", { url: `http://localhost:9000${route}` });
      await sleep(2500);

      const evalRes = await send("Runtime.evaluate", {
        expression: `(() => {
          const text = document.body ? document.body.innerText : "";
          const h1 = document.querySelector("h1, h2")?.innerText || "";
          const hasErrorText = text.includes("Something went wrong") || text.includes("Application Error") || text.includes("ChunkLoadError");
          return {
            title: document.title,
            h1,
            bodySnippet: text.slice(0, 120).replace(/\\n/g, " "),
            hasErrorText
          };
        })()`,
        returnByValue: true
      });

      const newErrors = errors.slice(routeErrorsBefore);
      const isOk = !evalRes.result?.value?.hasErrorText && newErrors.filter(e => e.type === "EXCEPTION").length === 0;

      routeResults.push({
        route,
        status: isOk ? "OK" : "ERROR",
        eval: evalRes.result?.value,
        errors: newErrors
      });

      console.log(`[AUDIT] Result for ${route}: ${isOk ? "✅ OK" : "❌ FAILED"}`);
      if (!isOk) {
        console.error("Details:", evalRes.result?.value, newErrors);
      }
    }

    console.log("\n==================== AUDIT SUMMARY ====================");
    console.table(routeResults.map(r => ({
      route: r.route,
      status: r.status,
      h1: r.eval?.h1 || "",
      errorsCount: r.errors.length
    })));

    ws.close();
  } catch (err) {
    console.error("[AUDIT FATAL]", err);
  } finally {
    chrome.kill("SIGKILL");
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

auditAdminRoutes();
