#!/usr/bin/env node
const path = require('path');

// Ensure 'start' argument is passed to Medusa CLI
if (!process.argv.includes('start') && !process.argv.includes('develop')) {
  process.argv.push('start');
}

// Pass port from environment variable (critical for Hostinger and cloud reverse proxies)
const port = process.env.PORT || '9000';
if (!process.argv.includes('-p') && !process.argv.includes('--port')) {
  process.argv.push('--port', port);
}

// Ensure host 0.0.0.0 is used in production
if (!process.argv.includes('-h') && !process.argv.includes('--host')) {
  process.argv.push('--host', '0.0.0.0');
}

// Locate @medusajs/cli
const possibleCliPaths = [
  path.resolve(__dirname, '../../node_modules/@medusajs/cli/cli.js'),
  path.resolve(__dirname, './node_modules/@medusajs/cli/cli.js'),
];

let cliPath = possibleCliPaths.find((p) => require('fs').existsSync(p));

if (!cliPath) {
  try {
    cliPath = require.resolve('@medusajs/cli/cli.js');
  } catch {}
}

if (!cliPath) {
  console.error('[PEPTECH] Could not locate @medusajs/cli. Run npm install.');
  process.exit(1);
}

require(cliPath);
