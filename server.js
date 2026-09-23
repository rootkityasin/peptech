const http = require('http');
const path = require('path');

const PORT = parseInt(process.env.PORT || '9000', 10);

console.log('----------------------------------------------------');
console.log('[PEPTECH] PEPTECH Medusa 2.0 Unified Server Booting...');
console.log(`[PEPTECH] Node.js Version: ${process.version}, PID: ${process.pid}`);
console.log(`[PEPTECH] Single Unified Port: ${PORT}`);
console.log('----------------------------------------------------');

process.on('uncaughtException', (err) => {
  console.error('[PEPTECH FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PEPTECH FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

let medusaHandler = null;

// 1. Create main server and listen IMMEDIATELY on PORT (< 5ms)
const server = http.createServer((req, res) => {
  // If Medusa is ready, pass request directly to Medusa in-memory
  if (medusaHandler) {
    medusaHandler(req, res);
    return;
  }

  // Health check during startup
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PEPTECH Gateway OK (Medusa engine initializing)');
    return;
  }

  // HTML page request during startup: show stylish splash with 3s refresh
  const isHtml = req.headers.accept && req.headers.accept.includes('text/html');
  if (isHtml || req.url === '/' || req.url === '/app') {
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

  // API calls during boot: wait up to 45 seconds for medusaHandler
  const startTime = Date.now();
  const poll = setInterval(() => {
    if (medusaHandler) {
      clearInterval(poll);
      medusaHandler(req, res);
    } else if (Date.now() - startTime > 45000) {
      clearInterval(poll);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server initializing, please retry.' }));
      }
    }
  }, 200);
});

// Call listen() immediately to satisfy LiteSpeed's 3-second watchdog
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[PEPTECH] Server listening on port ${PORT} (LiteSpeed watchdog satisfied!)`);
});

// 2. Intercept subsequent http.Server.prototype.listen calls so Medusa attaches to our server
const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (...args) {
  if (this === server) {
    return originalListen.apply(this, args);
  }

  console.log('[PEPTECH] Medusa server created. Attaching handler to active port', PORT);
  const listeners = this.listeners('request');
  if (listeners.length > 0) {
    medusaHandler = listeners[0];
  } else {
    this.once('newListener', (event, listener) => {
      if (event === 'request') {
        medusaHandler = listener;
      }
    });
  }

  process.nextTick(() => {
    this.emit('listening');
  });

  return this;
};

// 3. Boot Medusa backend in the same process
const backendDir = path.resolve(__dirname, 'backend/apps/backend');
process.chdir(backendDir);
require(path.join(backendDir, 'server.js'));
