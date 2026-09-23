const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[PEPTECH] Starting Medusa production build...');

const backendDir = path.resolve(__dirname, 'backend/apps/backend');

// 0. Sync custom admin chunks (ShopifyOrderList & ShopifyOrderDetail) before build
const updateChunksScript = path.resolve(backendDir, 'src/admin/update_chunks.js');
if (fs.existsSync(updateChunksScript)) {
  try {
    console.log('[PEPTECH] Syncing custom admin chunks...');
    require(updateChunksScript);
  } catch (chunkErr) {
    console.warn('[PEPTECH WARN] Could not run update_chunks.js:', chunkErr.message);
  }
}

// 1. Build Medusa backend and admin dashboard inside backend directory
execSync('npx medusa build --lint false', {
  stdio: 'inherit',
  cwd: backendDir,
  env: { ...process.env, NODE_ENV: 'production' },
});

const serverDir = path.resolve(backendDir, '.medusa/server');
const adminPublicDir = path.join(serverDir, 'public/admin');

// 2. Mirror admin build directly to root /app and backend public/admin
const rootAppDir = path.resolve(__dirname, 'app');
const rootAppAssetsDir = path.join(rootAppDir, 'assets');
const backendPublicAdminDir = path.join(backendDir, 'public/admin');
const backendPublicAdminAssetsDir = path.join(backendPublicAdminDir, 'assets');

if (fs.existsSync(adminPublicDir)) {
  // Mirror to root /app
  if (fs.existsSync(rootAppAssetsDir)) {
    fs.rmSync(rootAppAssetsDir, { recursive: true, force: true });
  }
  fs.cpSync(adminPublicDir, rootAppDir, { recursive: true });
  console.log('[PEPTECH] Mirrored admin build to root /app directory.');

  // Mirror to backend/apps/backend/public/admin
  if (fs.existsSync(backendPublicAdminAssetsDir)) {
    fs.rmSync(backendPublicAdminAssetsDir, { recursive: true, force: true });
  }
  fs.cpSync(adminPublicDir, backendPublicAdminDir, { recursive: true });
  console.log('[PEPTECH] Mirrored admin build to backend/apps/backend/public/admin directory.');
}

// 3. Prepare dist directory (for Hostinger 'Other' preset)
const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(serverDir)) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.cpSync(serverDir, distDir, { recursive: true });

  // Copy admin build to dist/app as well
  const distAppDir = path.join(distDir, 'app');
  const distAppAssetsDir = path.join(distAppDir, 'assets');
  if (fs.existsSync(distAppAssetsDir)) {
    fs.rmSync(distAppAssetsDir, { recursive: true, force: true });
  }
  if (fs.existsSync(adminPublicDir)) {
    fs.cpSync(adminPublicDir, distAppDir, { recursive: true });
  }

  // Copy root index.html and .htaccess to dist
  const rootIndex = path.resolve(__dirname, 'index.html');
  const rootHtaccess = path.resolve(__dirname, '.htaccess');
  if (fs.existsSync(rootIndex)) fs.copyFileSync(rootIndex, path.join(distDir, 'index.html'));
  if (fs.existsSync(rootHtaccess)) fs.copyFileSync(rootHtaccess, path.join(distDir, '.htaccess'));

  console.log('[PEPTECH] Mirrored .medusa/server and admin routes to dist directory.');
}

const entryScript = `const path = require('path');
require(path.resolve(__dirname, '../server.js'));
`;
fs.writeFileSync(path.join(distDir, 'index.js'), entryScript);
fs.writeFileSync(path.join(distDir, 'server.js'), entryScript);
fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify({
  name: "peptech-dist",
  version: "1.0.0",
  private: true,
  main: "server.js",
  scripts: { "start": "node server.js" },
  dependencies: { "express": "^5.2.1" }
}, null, 2));

// 4. Prepare .next/standalone & .next/static (for Hostinger 'Next.js' preset)
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
