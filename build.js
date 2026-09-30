const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[PEPTECH] Starting Medusa production build...');

const backendDir = path.resolve(__dirname, 'backend/apps/backend');


// 1. Build Medusa backend and admin dashboard inside backend directory
const cleanNodeOptions = (process.env.NODE_OPTIONS || '')
  .replace(/-r\s+ts-node\/register/g, '')
  .replace(/--require\s+ts-node\/register/g, '')
  .trim();

const buildEnv = {
  ...process.env,
  NODE_ENV: 'production',
};
if (cleanNodeOptions) {
  buildEnv.NODE_OPTIONS = cleanNodeOptions;
} else {
  delete buildEnv.NODE_OPTIONS;
}

execSync('npm run build', {
  stdio: 'inherit',
  cwd: backendDir,
  env: buildEnv,
});

const serverDir = path.resolve(backendDir, '.medusa/server');
const adminPublicDir = path.join(serverDir, 'public/admin');

// 2. Mirror production assets for the hosting preset, never into source public/.
const rootAppDir = path.resolve(__dirname, 'app');
const rootAppAssetsDir = path.join(rootAppDir, 'assets');

if (fs.existsSync(adminPublicDir)) {
  // Mirror to root /app
  if (fs.existsSync(rootAppAssetsDir)) {
    fs.rmSync(rootAppAssetsDir, { recursive: true, force: true });
  }
  fs.cpSync(adminPublicDir, rootAppDir, { recursive: true });
  console.log('[PEPTECH] Mirrored admin build to root /app directory.');

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

// 4. Ensure logo.webp and PEPTECH Admin branding in index.html across all outputs
const logoSource = fs.existsSync(path.resolve(__dirname, 'storefront/public/logo.webp'))
  ? path.resolve(__dirname, 'storefront/public/logo.webp')
  : path.resolve(__dirname, 'app/logo.webp');
if (fs.existsSync(logoSource)) {
  const logoTargets = [
    path.join(adminPublicDir, 'logo.webp'),
    path.join(distDir, 'app/logo.webp'),
    path.join(distDir, 'public/admin/logo.webp'),
  ];
  for (const lt of logoTargets) {
    try {
      fs.mkdirSync(path.dirname(lt), { recursive: true });
      fs.copyFileSync(logoSource, lt);
    } catch {}
  }
  console.log('[PEPTECH] Synced logo.webp across all public and dist directories.');
}

// 4.1 Sync images across all public and dist directories
const imagesSource = path.resolve(__dirname, 'storefront/public/images');
if (fs.existsSync(imagesSource)) {
  const imagesTargets = [
    path.join(serverDir, 'public/images'),
    path.join(serverDir, 'public/admin/images'),
    path.join(rootAppDir, 'images'),
    path.join(distDir, 'images'),
    path.join(distDir, 'public/images'),
    path.join(distDir, 'public/admin/images'),
    path.join(distDir, 'app/images'),
  ];
  for (const it of imagesTargets) {
    try {
      fs.mkdirSync(it, { recursive: true });
      fs.cpSync(imagesSource, it, { recursive: true });
    } catch {}
  }
  console.log('[PEPTECH] Synced images across all public and dist directories.');
}

const htmlTargets = [
  path.join(rootAppDir, 'index.html'),
  path.join(adminPublicDir, 'index.html'),
  path.join(distDir, 'app/index.html'),
];

for (const ht of htmlTargets) {
  if (fs.existsSync(ht)) {
    let html = fs.readFileSync(ht, 'utf8');
    let htmlMod = false;
    if (html.includes('<title>Medusa</title>') || html.includes('<title>Medusa Admin</title>')) {
      html = html.replace(/<title>.*?<\/title>/, '<title>PEPTECH® Admin</title>');
      htmlMod = true;
    }
    if (!html.includes('/app/logo.webp')) {
      html = html.replace('</head>', '  <link rel="icon" href="/app/logo.webp" />\n</head>');
      htmlMod = true;
    }
    if (htmlMod) {
      fs.writeFileSync(ht, html, 'utf8');
      console.log(`[PEPTECH] Injected title and logo into ${ht}`);
    }
  }
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
