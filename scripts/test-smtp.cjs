#!/usr/bin/env node

/**
 * PEPTECH® SMTP & Titan Email Verification Script
 * 
 * Verifies your Hostinger Titan Email (or other SMTP provider) credentials,
 * tests the TLS socket handshake, and optionally dispatches a test email.
 * 
 * Usage:
 *   node scripts/test-smtp.cjs [recipient-email@domain.com]
 */

const fs = require("node:fs");
const path = require("node:path");

// Self-contained .env parser (zero dependency)
function loadEnv() {
  const envPaths = [
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../backend/apps/backend/.env")
  ];
  
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined || process.env[key] === "") {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

// Resolve nodemailer from workspace node_modules
let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch {
  try {
    nodemailer = require(path.resolve(__dirname, "../backend/node_modules/nodemailer"));
  } catch {
    try {
      nodemailer = require(path.resolve(__dirname, "../backend/apps/backend/node_modules/nodemailer"));
    } catch (err) {
      console.error("❌ Could not load nodemailer. Ensure npm install has been run.");
      process.exit(1);
    }
  }
}

async function main() {
  console.log("\n=======================================================");
  console.log("   PEPTECH® SMTP & Titan Email Diagnostics Tool");
  console.log("=======================================================\n");

  const host = process.env.STRIPE_EMAIL_HOST || "smtp.hostinger.com";
  const port = Number(process.env.STRIPE_EMAIL_PORT || 465);
  const user = process.env.STRIPE_EMAIL_USER;
  const pass = process.env.STRIPE_EMAIL_PASSWORD;
  const from = process.env.STRIPE_EMAIL_FROM || `"PEPTECH Research" <${user || "notifications@peptech.bio"}>`;
  const targetRecipient = process.argv[2] || user;

  console.log(`[Config Check]`);
  console.log(`  • Host:     ${host}`);
  console.log(`  • Port:     ${port} (${port === 465 ? "SSL Direct" : "TLS/STARTTLS"})`);
  console.log(`  • User:     ${user || "❌ MISSING (Set STRIPE_EMAIL_USER in .env)"}`);
  console.log(`  • Password: ${pass ? "••••••••••••" : "❌ MISSING (Set STRIPE_EMAIL_PASSWORD in .env)"}`);
  console.log(`  • From:     ${from}`);
  console.log(`-------------------------------------------------------`);

  if (!user || !pass) {
    console.error("\n❌ ERROR: STRIPE_EMAIL_USER and STRIPE_EMAIL_PASSWORD must be defined in your .env file.");
    console.log("Add your Hostinger Titan Email credentials to .env:\n");
    console.log("  STRIPE_EMAIL_HOST=smtp.hostinger.com");
    console.log("  STRIPE_EMAIL_PORT=465");
    console.log("  STRIPE_EMAIL_USER=notifications@peptech.bio");
    console.log("  STRIPE_EMAIL_PASSWORD=your_titan_email_password");
    console.log('  STRIPE_EMAIL_FROM="PEPTECH Research" <notifications@peptech.bio>\n');
    process.exit(1);
  }

  console.log("\n[1/2] Connecting to SMTP server and validating credentials...");
  const startTime = Date.now();

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: true },
  });

  try {
    await transport.verify();
    const duration = Date.now() - startTime;
    console.log(`✅ SMTP Connection & Authentication Successful! (${duration}ms)`);
  } catch (err) {
    console.error(`\n❌ SMTP Connection Failed:`);
    console.error(`  Error Code:    ${err.code || "UNKNOWN"}`);
    console.error(`  Error Message: ${err.message}`);
    if (err.code === "EAUTH") {
      console.error("\n💡 Hint: Check that your email and password are typed correctly.");
      console.error("If two-factor authentication is active on Titan, generate an App Password in webmail.");
    }
    process.exit(1);
  }

  if (targetRecipient) {
    console.log(`\n[2/2] Sending test verification email to: ${targetRecipient}...`);
    try {
      const info = await transport.sendMail({
        from,
        to: targetRecipient,
        subject: "PEPTECH® System Verification: SMTP Active",
        text: `PEPTECH Research Commerce Mailer\n\nThis confirms that the Hostinger Titan Email integration is functioning properly for ${user}.\nTimestamp: ${new Date().toISOString()}\n\nSubscription reminders and order receipts will dispatch automatically.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #FFFFFF;">
            <div style="padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px;">
              <span style="font-size: 20px; font-weight: 700; color: #0B1F3A; letter-spacing: 0.5px;">PEPTECH<span style="color: #16A6A3;">®</span></span>
              <span style="font-size: 11px; color: #64748B; margin-left: 10px; text-transform: uppercase; letter-spacing: 1px;">Quality. Safety. Precision.</span>
            </div>
            <h2 style="font-size: 18px; color: #0B1F3A; margin-top: 0;">SMTP Dispatch Verified</h2>
            <p style="color: #334155; line-height: 1.6; font-size: 14px;">
              Your Hostinger Titan Email configuration has been successfully verified for automated laboratory notifications.
            </p>
            <div style="background-color: #F8FAFC; border-left: 4px solid #16A6A3; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #475569;">
              <strong>Host:</strong> ${host}<br>
              <strong>Port:</strong> ${port} (SSL Secured)<br>
              <strong>Sender:</strong> ${user}<br>
              <strong>Handshake Time:</strong> ${new Date().toISOString()}
            </div>
            <p style="color: #64748B; font-size: 12px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
              This is an automated system verification sent from the PEPTECH® Commerce Backend.
            </p>
          </div>
        `,
      });

      console.log(`✅ Test email delivered successfully!`);
      console.log(`  • Message ID: ${info.messageId}`);
      console.log(`  • Accepted by: ${info.accepted.join(", ")}`);
    } catch (sendErr) {
      console.error(`\n❌ Failed to dispatch test email: ${sendErr.message}`);
      process.exit(1);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 All SMTP tests passed! Production mailer is ready.");
  console.log("=======================================================\n");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
