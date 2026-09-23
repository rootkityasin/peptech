const path = require('path');

console.log('----------------------------------------------------');
console.log('[PEPTECH] PEPTECH Medusa 2.0 Web App Booting...');
console.log(`[PEPTECH] Node.js Version: ${process.version}`);
console.log(`[PEPTECH] Process ID: ${process.pid}`);
console.log(`[PEPTECH] Port: ${process.env.PORT || 9000}`);
console.log(`[PEPTECH] Working Directory: ${process.cwd()}`);
console.log('----------------------------------------------------');

process.on('uncaughtException', (err) => {
  console.error('[PEPTECH FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PEPTECH FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Change working directory to backend/apps/backend
const backendDir = path.resolve(__dirname, 'backend/apps/backend');
process.chdir(backendDir);

// Execute backend startup script directly on the configured PORT
require(path.join(backendDir, 'server.js'));
