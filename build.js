const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[PEPTECH] Starting Medusa production build...');

const backendDir = path.resolve(__dirname, 'backend/apps/backend');

// 1. Build Medusa backend and admin dashboard inside backend directory
execSync('npx medusa build --lint false', {
  stdio: 'inherit',
  cwd: backendDir,
  env: { ...process.env, NODE_ENV: 'production' },
});

// 2. Prepare dist directory (for Hostinger 'Other' preset)
const distDir = path.resolve(__dirname, 'dist');
const serverDir = path.resolve(backendDir, '.medusa/server');

if (fs.existsSync(serverDir)) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.cpSync(serverDir, distDir, { recursive: true });
  console.log('[PEPTECH] Mirrored .medusa/server to dist directory.');
}

const entryScript = `const path = require('path');
const backendDir = path.resolve(__dirname, '../backend/apps/backend');
process.chdir(backendDir);
require(path.join(backendDir, 'server.js'));
`;
fs.writeFileSync(path.join(distDir, 'index.js'), entryScript);
fs.writeFileSync(path.join(distDir, 'server.js'), entryScript);

// 3. Prepare .next/standalone & .next/static (for Hostinger 'Next.js' preset)
const nextDir = path.resolve(__dirname, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const nextStaticDir = path.join(nextDir, 'static');

if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
}
if (!fs.existsSync(nextStaticDir)) {
  fs.mkdirSync(nextStaticDir, { recursive: true });
}

// Copy public admin assets to .next/static
const adminPublicDir = path.join(serverDir, 'public');
if (fs.existsSync(adminPublicDir)) {
  fs.cpSync(adminPublicDir, nextStaticDir, { recursive: true });
}

const standaloneScript = `const path = require('path');
const backendDir = path.resolve(__dirname, '../../backend/apps/backend');
process.chdir(backendDir);
require(path.join(backendDir, 'server.js'));
`;
fs.writeFileSync(path.join(standaloneDir, 'server.js'), standaloneScript);
fs.writeFileSync(path.join(standaloneDir, 'package.json'), JSON.stringify({ name: "peptech-server", private: true, main: "server.js" }, null, 2));

console.log('[PEPTECH] Prepared .next/standalone and dist build outputs.');
console.log('[PEPTECH] Production build completed successfully!');
