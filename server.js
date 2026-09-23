const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '9000', 10);
const MEDUSA_PORT = PORT === 9005 ? 9006 : 9005;

console.log('----------------------------------------------------');
console.log('[PEPTECH] PEPTECH Medusa 2.0 LiteSpeed Gateway Booting...');
console.log(`[PEPTECH] Node Version: ${process.version}, PID: ${process.pid}`);
console.log(`[PEPTECH] External/Public Port: ${PORT}`);
console.log(`[PEPTECH] Internal Medusa Port: ${MEDUSA_PORT}`);
console.log(`[PEPTECH] CWD: ${process.cwd()}`);
console.log('----------------------------------------------------');

process.on('uncaughtException', (err) => {
  console.error('[PEPTECH FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PEPTECH FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

let isMedusaReady = false;
let medusaStarting = true;

// Proxy helper function
function proxyRequest(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: MEDUSA_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: req.headers.host || `127.0.0.1:${PORT}`,
      'x-forwarded-for': req.socket.remoteAddress || req.headers['x-forwarded-for'] || '',
      'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'https',
      'x-forwarded-port': String(PORT),
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('[PEPTECH PROXY] Connection error:', err.message);
    if (!res.headersSent) {
      res.writeHead(503, { 'Content-Type': 'application/json', 'Retry-After': '2' });
      res.end(JSON.stringify({ error: 'Medusa engine initializing. Please retry in 2 seconds.' }));
    }
  });

  req.pipe(proxyReq, { end: true });
}

// 1. Immediately create and bind HTTP server to satisfy LiteSpeed's 3-second watchdog timer
const server = http.createServer((req, res) => {
  // Redirect root '/' to '/app'
  if (req.url === '/' || req.url === '') {
    res.writeHead(302, { Location: '/app' });
    res.end();
    return;
  }

  // Health endpoint on the proxy itself
  if (req.url === '/health' && !isMedusaReady) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PEPTECH Gateway OK (Medusa engine initializing)');
    return;
  }

  if (isMedusaReady) {
    proxyRequest(req, res);
    return;
  }

  // Medusa is still starting up
  const isHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (isHtml) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="3">
  <title>PEPTECH® Admin - Initializing...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B1F3A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { text-align: center; padding: 48px 40px; background: rgba(255,255,255,0.04); border-radius: 16px; border: 1px solid rgba(22,166,163,0.3); max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF; margin-bottom: 24px; }
    .logo span { color: #16A6A3; }
    .spinner { margin: 24px auto; width: 40px; height: 40px; border: 3px solid rgba(22,166,163,0.15); border-top-color: #16A6A3; border-radius: 50%; animation: spin 0.8s infinite linear; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 18px; margin: 0 0 8px; color: #E2E8F0; font-weight: 600; }
    p { font-size: 13px; color: #94A3B8; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">PEPTECH<span>®</span></div>
    <div class="spinner"></div>
    <h2>Starting Application Services</h2>
    <p>Initializing secure Medusa 2.0 engine and database connections. This page will refresh automatically...</p>
  </div>
</body>
</html>`);
    return;
  }

  // For API calls, hold connection and poll for readiness (up to 30s)
  const startTime = Date.now();
  const pollInterval = setInterval(() => {
    if (isMedusaReady) {
      clearInterval(pollInterval);
      proxyRequest(req, res);
    } else if (Date.now() - startTime > 30000) {
      clearInterval(pollInterval);
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gateway timeout waiting for Medusa engine startup' }));
      }
    }
  }, 500);
});

// Immediately listen to satisfy lsnode.js
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[PEPTECH] LiteSpeed Gateway actively listening on 0.0.0.0:${PORT} (Watchdog satisfied!)`);
});

// 2. Health check poller to detect when Medusa is ready
function pollMedusaHealth() {
  const checkReq = http.get(`http://127.0.0.1:${MEDUSA_PORT}/health`, (checkRes) => {
    if (checkRes.statusCode === 200) {
      if (!isMedusaReady) {
        isMedusaReady = true;
        medusaStarting = false;
        console.log(`[PEPTECH] Medusa 2.0 is fully READY on internal port ${MEDUSA_PORT}! Forwarding traffic.`);
      }
    } else {
      setTimeout(pollMedusaHealth, 1000);
    }
  });

  checkReq.on('error', () => {
    setTimeout(pollMedusaHealth, 1000);
  });
}

// 3. Launch Medusa child process on internal port
const backendDir = path.resolve(__dirname, 'backend/apps/backend');
const backendScript = path.join(backendDir, 'server.js');

console.log(`[PEPTECH] Spawning Medusa child process on 127.0.0.1:${MEDUSA_PORT}...`);

const medusaProcess = spawn(process.execPath, [
  backendScript,
  'start',
  '--port', String(MEDUSA_PORT),
  '--host', '127.0.0.1'
], {
  cwd: backendDir,
  env: {
    ...process.env,
    PORT: String(MEDUSA_PORT),
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

medusaProcess.stdout.on('data', (data) => {
  const msg = data.toString();
  process.stdout.write(msg);
  if (msg.includes('Server is ready on port') || msg.includes('ready on port')) {
    isMedusaReady = true;
    medusaStarting = false;
    console.log(`[PEPTECH] Medusa 2.0 readiness signal detected!`);
  }
});

medusaProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

medusaProcess.on('exit', (code, signal) => {
  console.error(`[PEPTECH] Medusa child process exited with code ${code}, signal ${signal}`);
  isMedusaReady = false;
});

// Start polling for health
setTimeout(pollMedusaHealth, 2000);
