import React from "react"

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono uppercase tracking-wider">
          UK GDPR &amp; PECR Compliant
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Data Controller: PEPTECH INDUSTRIES LTD • peptech.bio</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Information We Collect</h2>
        <p>
          We collect personal identification data necessary to process your orders, comply with UK research chemical record-keeping standards, and fulfill shipments via Royal Mail. This includes name, delivery address, billing address, email address, phone number (for courier tracking notifications), and institutional affiliation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Zero Raw Card Data Retention</h2>
        <p>
          Payment card details are securely handled by certified, underwritten payment processors with 3-D Secure compliance. PEPTECH does not store or process raw credit card numbers or security codes on its servers. Tokenized recurring billing tokens are maintained exclusively by PCI-DSS compliant vaulting gateways.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Your Data Rights Under UK GDPR</h2>
        <p>
          Under UK data protection law, you have rights including:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li><strong>Access</strong>: The right to request copies of your personal data held by PEPTECH.</li>
          <li><strong>Rectification &amp; Erasure</strong>: The right to correct inaccurate data or request deletion of non-essential records.</li>
          <li><strong>Opt-Out</strong>: The right to withdraw consent for non-transactional communications at any time.</li>
        </ul>
      </section>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        To exercise your data rights, contact our Data Protection Officer at <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] underline">info@peptech.bio</a>.
      </div>
    </main>
  )
}
