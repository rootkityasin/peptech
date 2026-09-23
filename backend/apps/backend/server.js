// Allow self-signed / intermediate SSL certificates for cloud database poolers (Supabase AWS pooler)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

console.log('[PEPTECH] Backend server script executing in:', process.cwd());

// Ensure process.argv has at least [node, scriptPath]
while (process.argv.length < 2) {
  process.argv.push(__filename);
}

// Ensure 'start' or 'develop' command is explicitly present
const hasCommand = process.argv.slice(2).some(arg => !arg.startsWith('-'));
if (!hasCommand) {
  process.argv.splice(2, 0, 'start');
}

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
