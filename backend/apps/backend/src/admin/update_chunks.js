const fs = require('fs');
const path = require('path');

const possibleDistDirs = [
  path.resolve(__dirname, '../../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../node_modules/@medusajs/dashboard/dist'),
];

let distDir = possibleDistDirs.find(d => fs.existsSync(d));

console.log('[PEPTECH] Updating dashboard chunks in:', distDir);

if (!distDir) {
  console.warn('[PEPTECH] Could not locate @medusajs/dashboard/dist directory. Checked:', possibleDistDirs);
} else {
  // Purge Vite dev cache in backend to ensure clean asset compilation
  const viteCacheDir = path.resolve(__dirname, '../../node_modules/.vite');
  if (fs.existsSync(viteCacheDir)) {
    try {
      fs.rmSync(viteCacheDir, { recursive: true, force: true });
      console.log('[PEPTECH] Successfully cleared stale Vite dependency cache');
    } catch (e) {
      console.warn('[PEPTECH WARN] Could not clear .vite cache:', e.message);
    }
  }
}
