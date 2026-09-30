const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureAdminScreenshots() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-admin-snap-'));
  console.log('[CDP] Starting headless Google Chrome with clean profile at:', tmpDir);

  const chromeProcess = spawn('/usr/bin/google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=1440,900',
    '--user-data-dir=' + tmpDir,
    'http://localhost:9000/app/login',
  ]);

  await sleep(2000);

  try {
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await res.json();
    const target = targets.find((t) => t.type === 'page' && t.url.includes('localhost:9000'));
    if (!target || !target.webSocketDebuggerUrl) {
      throw new Error('Could not get webSocketDebuggerUrl from Chrome');
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails);
      }
      if (data.method === 'Log.entryAdded') {
        console.log('[BROWSER LOG]', data.params.entry);
      }
      if (data.id && callbacks.has(data.id)) {
        const { resolve, reject } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('[CDP] Waiting for login page to load...');
    await sleep(2000);

    console.log('[CDP] Authenticating via SDK login API...');
    await send('Runtime.evaluate', {
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
      awaitPromise: true,
      returnByValue: true
    });
    await sleep(1000);

    // 1. Capture Orders List Snapshot
    console.log('[CDP] Navigating to http://localhost:9000/app/orders...');
    await send('Page.navigate', { url: 'http://localhost:9000/app/orders' });

    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      const check = await send('Runtime.evaluate', {
        expression: `(() => {
          const rows = document.querySelectorAll("tbody tr").length;
          const h1 = document.querySelector("h1")?.innerText || "";
          return { rows, h1 };
        })()`,
        returnByValue: true,
      });
      console.log(`[CDP] Orders page check ${i + 1}:`, check.result?.value);
      if (check.result?.value?.rows > 0 || (check.result?.value?.h1 && check.result.value.h1.includes("Orders"))) {
        console.log('[CDP] Order List fully rendered!');
        break;
      }
    }

    await sleep(2000);
    const ssOrders = await send('Page.captureScreenshot', { format: 'png' });
    const listPath = path.resolve(
      '/home/shayan/.gemini/antigravity-cli/brain/bb8bfcff-b27e-48bd-bc0f-31c53c341e46',
      'admin_orders_snapshot.png'
    );
    fs.writeFileSync(listPath, Buffer.from(ssOrders.data, 'base64'));
    console.log('[CDP] Saved list snapshot successfully:', listPath);

    // 2. Capture Order Detail Snapshot
    console.log('[CDP] Navigating to http://localhost:9000/app/orders/order_01H1016DEMO...');
    await send('Page.navigate', { url: 'http://localhost:9000/app/orders/order_01H1016DEMO' });
    
    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      const check = await send('Runtime.evaluate', {
        expression: `(() => {
          const text = document.body ? document.body.innerText : "";
          return { hasOrder: text.includes("Order details") || text.includes("Fulfillments") || text.includes("#") };
        })()`,
        returnByValue: true,
      });
      if (check.result?.value?.hasOrder) {
        console.log('[CDP] Order Detail fully rendered!');
        break;
      }
    }

    await sleep(2000);
    const ssDetail = await send('Page.captureScreenshot', { format: 'png' });
    const detailPath = path.resolve(
      '/home/shayan/.gemini/antigravity-cli/brain/bb8bfcff-b27e-48bd-bc0f-31c53c341e46',
      'admin_order_detail_snapshot.png'
    );
    fs.writeFileSync(detailPath, Buffer.from(ssDetail.data, 'base64'));
    console.log('[CDP] Saved detail snapshot successfully:', detailPath);

    ws.close();
  } catch (err) {
    console.error('[CDP] Error:', err);
  } finally {
    chromeProcess.kill('SIGKILL');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

captureAdminScreenshots();
