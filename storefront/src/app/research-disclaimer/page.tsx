import React from "react"

export default function ResearchDisclaimerPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-mono uppercase tracking-wider">
          Statutory Scientific Notice
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Research Use Only (RUO) Disclaimer
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Last Updated: September 2026 • Domain: peptech.bio</p>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-medium space-y-2">
        <h3 className="font-bold text-sm">IMPORTANT REGULATORY DISCLOSURE:</h3>
        <p>
          All compounds, prefilled cartridges, and lyophilised peptides supplied by <strong>PEPTECH®</strong> are manufactured and distributed solely for <strong>laboratory, scientific, and educational research purposes</strong>. Under no circumstances are these products intended for human or veterinary use.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Age Requirement &amp; Purchasing Restrictions</h2>
        <p>
          Purchasers must be at least eighteen (18) years of age. By placing an order with PEPTECH®, the customer represents, warrants, and certifies that they possess the necessary laboratory qualifications, safety equipment, and scientific knowledge to safely handle, store, and dispose of research-grade chemical materials.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Prohibition of Human &amp; Animal Consumption</h2>
        <p>
          None of the products sold on this website are approved by the UK MHRA, US FDA, or any equivalent global health authority for human consumption, clinical trials in humans, food additives, cosmetics, drugs, or medical devices. The compounds must not be introduced into humans or animals in any manner.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Zero Medical or Therapeutic Claims</h2>
        <p>
          PEPTECH® makes zero therapeutic, medical, bodybuilding, diagnostic, or clinical-outcome claims. Any descriptions provided on this website are presented purely for chemical, molecular, and educational reference. Dosing protocols or injection guidance are strictly prohibited and will never be provided by our support team.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Laboratory Handling &amp; Indemnification</h2>
        <p>
          All materials must be handled in compliance with applicable laboratory health and safety standards. The buyer agrees to indemnify, defend, and hold harmless PEPTECH INDUSTRIES LTD from any liabilities, damages, or claims arising from the improper handling, unauthorized use, or resale of these research compounds.
        </p>
      </section>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        Inquiries regarding compound specifications and testing reports should be directed to <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] underline">info@peptech.bio</a>.
      </div>
    </main>
  )
}
