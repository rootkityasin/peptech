#!/usr/bin/env node
const path = require('path');

// Change working directory to backend/apps/backend
const backendDir = path.resolve(__dirname, 'backend/apps/backend');
process.chdir(backendDir);

// Execute backend startup script
require(path.join(backendDir, 'server.js'));
