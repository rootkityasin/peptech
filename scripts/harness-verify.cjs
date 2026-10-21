/**
 * PEPTECH® Deterministic Harness Verification Suite
 * Inspired by Google Research Harness² (Dual-Loop Probing & Verification)
 * 
 * Runs all deterministic verifiers to guarantee zero-defect, production-ready code.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'backend/apps/backend');
const STOREFRONT_DIR = path.resolve(ROOT_DIR, 'storefront');

function runStep(name, fn) {
  const start = Date.now();
  process.stdout.write(`\n[HARNESS] Running: ${name}... `);
  try {
    fn();
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\x1b[32mPASSED\x1b[0m (${duration}s)`);
    return true;
  } catch (err) {
    console.log(`\x1b[31mFAILED\x1b[0m`);
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

console.log('====================================================');
console.log('   PEPTECH® HARNESS² DETERMINISTIC VERIFICATION     ');
console.log('====================================================');

try {
  // 1. Mandatory Zero-Exposure Secret Scan
  runStep('Zero-Exposure Secret Verification', () => {
    const diff = execSync('git diff HEAD', { cwd: ROOT_DIR, encoding: 'utf8' });
    const secretPattern = /(?:sk_live|sk_test|pk_live|pk_test|password\s*[:=]\s*["'][^"']+["'])/i;
    if (secretPattern.test(diff)) {
      throw new Error('Detected potential secret or private API key in uncommitted git diff!');
    }
  });

  // 2. Medusa Commerce Unit Test Suite
  runStep('Commerce Unit Test Suite (Jest)', () => {
    const env = {
      ...process.env,
      TEST_TYPE: 'unit',
      NODE_OPTIONS: '--experimental-vm-modules',
    };
    execSync('npx jest src/lib/commerce/__tests__/ src/lib/__tests__/ --runInBand --forceExit --silent', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env,
    });
  });

  // 3. Medusa Backend TypeScript Typecheck
  runStep('Backend TypeScript Verification (tsc)', () => {
    execSync('npx tsc --noEmit', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
    });
  });

  // 4. Storefront TypeScript & Next.js Compilation
  runStep('Storefront Production Build & Typecheck (Next.js)', () => {
    execSync('npm run build', {
      cwd: STOREFRONT_DIR,
      stdio: 'pipe',
    });
  });

  console.log('\n====================================================');
  console.log(' \x1b[32m✔ HARNESS VERIFICATION PASSED: CODE IS PRODUCTION-READY\x1b[0m');
  console.log('====================================================\n');
  process.exit(0);
} catch (error) {
  console.error('\n\x1b[31m[HARNESS FAILURE] Deterministic verifier failed. Reverting or fixing required before commit.\x1b[0m\n');
  process.exit(1);
}

