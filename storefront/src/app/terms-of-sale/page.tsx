import React from "react"

export default function TermsOfSalePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-mono uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Terms of Sale &amp; Subscription Agreement
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Governed by the Laws of England and Wales</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Eligibility &amp; Research Acknowledgement</h2>
        <p>
          By placing an order via <code>peptech.bio</code>, you warrant that you are aged 18 or older and purchase all items exclusively for scientific, educational, or laboratory analysis. Any attempted purchase for human use is void and subject to immediate cancellation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. 28-Day Subscribe &amp; Save Terms</h2>
        <p>
          Customers selecting the <strong>Subscribe &amp; Save (28 Days)</strong> option receive an automatic 10% discount on the standard single-purchase price. By enrolling, you authorize PEPTECH to charge your saved tokenized payment method every twenty-eight (28) calendar days until paused or cancelled.
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li><strong>Renewal Reminders</strong>: An email reminder is automatically dispatched 3 days prior to each recurring charge.</li>
          <li><strong>Self-Service Management</strong>: You may pause, skip an upcoming dispatch, adjust renewal dates, or cancel at any time via your customer account dashboard without contacting support.</li>
          <li><strong>Failed Payments</strong>: If a recurring charge fails, our billing system executes smart retry attempts over a 7-day period before placing the subscription on hold.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Secure Payment &amp; Gateway Compliance</h2>
        <p>
          All credit and debit card transactions are processed securely through certified high-risk payment acquirers with mandatory 3-D Secure (SCA) verification. PEPTECH never stores raw credit card details on its servers. Direct bank settlements via UK Faster Payments are fulfilled upon automated receipt confirmation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Shipping, Customs &amp; Deliveries</h2>
        <p>
          All orders are dispatched via Royal Mail Tracked (£4.95 UK / £15.00 Worldwide). International recipients are responsible for any applicable local customs duties and regulatory import compliance in their respective jurisdiction.
        </p>
      </section>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        For order inquiries: <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] underline">info@peptech.bio</a>.
      </div>
    </main>
  )
}
