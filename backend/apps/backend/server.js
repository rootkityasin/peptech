// Allow self-signed / intermediate SSL certificates for cloud database poolers (Supabase AWS pooler)


if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*(&|$)/gi, (m, p, s) => {
    if (p === '?' && s === '&') return '?';
    if (p === '?' && s === '') return '';
    if (p === '&') return s;
    return '';
  });
}

const path = require('path');
const fs = require('fs');

// Production always runs the compiled application, never the TypeScript tree.
const serverDir = fs.existsSync(path.join(__dirname, 'medusa-config.ts'))
  ? path.join(__dirname, '.medusa/server')
  : __dirname;
if (!fs.existsSync(path.join(serverDir, 'medusa-config.js')) ||
    !fs.existsSync(path.join(serverDir, 'public/admin/index.html'))) {
  console.error('[PEPTECH] Production build missing. Run npm run build before npm start.');
  process.exit(1);
}
process.env.NODE_ENV = 'production';
process.chdir(serverDir);

console.log('[PEPTECH] Backend server script executing in:', process.cwd());

// Ensure process.argv has at least [node, scriptPath]
while (process.argv.length < 2) {
  process.argv.push(__filename);
}

// This entrypoint is production-only; development uses `medusa develop`.
process.argv = [process.argv[0], __filename, 'start', ...process.argv.slice(2)];

// Pass port from environment variable (critical for Hostinger and cloud reverse proxies)
const port = process.env.PORT || '9000';
if (!process.argv.includes('-p') && !process.argv.includes('--port')) {
  process.argv.push('--port', String(port));
}

// Ensure host 0.0.0.0 is used in production
if (!process.argv.includes('-h') && !process.argv.includes('--host')) {
  process.argv.push('--host', '0.0.0.0');
}

console.log(`[PEPTECH] Target host: 0.0.0.0, port: ${port}`);

// Locate @medusajs/cli
const possibleCliPaths = [
  path.resolve(__dirname, '../../node_modules/@medusajs/cli/cli.js'),
  path.resolve(__dirname, './node_modules/@medusajs/cli/cli.js'),
  path.resolve(__dirname, '../../../node_modules/@medusajs/cli/cli.js'),
];

let cliPath = possibleCliPaths.find((p) => fs.existsSync(p));

if (!cliPath) {
  try {
    cliPath = require.resolve('@medusajs/cli/cli.js');
  } catch {}
}

if (!cliPath) {
  console.error('[PEPTECH FATAL] Could not locate @medusajs/cli. Checked:', possibleCliPaths);
  process.exit(1);
}

console.log('[PEPTECH] Medusa CLI found at:', cliPath);
console.log('[PEPTECH] Invoking Medusa CLI with args:', process.argv.slice(2));

require(cliPath);
