const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[PEPTECH] Starting Medusa production build...');

// 1. Build Medusa backend and admin dashboard
execSync('npm run build --prefix backend/apps/backend', { stdio: 'inherit' });

// 2. Prepare dist directory for Hostinger output directory check
const distDir = path.resolve(__dirname, 'dist');
const serverDir = path.resolve(__dirname, 'backend/apps/backend/.medusa/server');

if (fs.existsSync(serverDir)) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.cpSync(serverDir, distDir, { recursive: true });
  console.log('[PEPTECH] Mirrored .medusa/server to dist directory.');
}

// 3. Create entry points in dist
const entryScript = `const path = require('path');
const backendDir = path.resolve(__dirname, '../backend/apps/backend');
process.chdir(backendDir);
require(path.join(backendDir, 'server.js'));
`;
fs.writeFileSync(path.join(distDir, 'index.js'), entryScript);
fs.writeFileSync(path.join(distDir, 'server.js'), entryScript);

console.log('[PEPTECH] Production build completed successfully!');
