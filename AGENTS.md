# PEPTECH® Workspace Guidelines & Rules

Refer to `GEMINI.md` for the comprehensive compliance, design, architecture, and regulatory rules governing this repository.

Key highlights:
- **Brand**: PEPTECH® (`#0B1F3A` Navy, `#16A6A3` / `#00C5A0` Teal, `#FFFFFF` White).
- **Admin**: Keep Medusa 2.0 Admin Dashboard completely native in default styling.
- **Product Routes**: 
  1. Complete Pen Sets (one-time only; reusable pen + cartridge + accessories).
  2. Refill Cartridges (one-time & 28-day Subscribe & Save @ 10% discount; cross-link to pen).
  3. Freeze-Dried Vials (one-time & 28-day Subscribe & Save @ 10% discount).
- **Compliance**: Research Use Only (RUO), 18+ gate, zero dosing/medical/human-consumption claims.
- **Payments**: High-risk peptide compliance, tokenized 28-day subscriptions via Authorize.Net / approved acquirers + UK Bank Transfer.
- **Logistics**: Royal Mail Tracked (£4.95 UK / £15 Worldwide), discreet outer packaging.
- **COA & QR**: Central searchable lab report library + packaging QR verification (`/verify`).
- **Security & Secrets**: Strict Zero-Exposure rule. NEVER hardcode secrets, fallback tokens, or commit `.env` files. Read strictly from `process.env`.
- **Zero Git Touch & Single-Use Permission Rule**: NEVER touch Git (`git add`, `git commit`, `git push`, or any `git` command) until the user explicitly tells you to. If the user grants permission once, that permission applies ONLY to that single request and NEVER carries over to next updates.
