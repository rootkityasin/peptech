import React from "react"

export default function ShippingReturnsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono uppercase tracking-wider">
          Logistics Policy
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Shipping, Discreet Delivery &amp; Returns
        </h1>
        <p className="text-xs text-zinc-500 font-mono">Royal Mail Click &amp; Drop Services</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Royal Mail Tracked Delivery Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">United Kingdom Tracked</h4>
            <div className="font-mono text-xl font-black text-[var(--color-brand-navy)] dark:text-zinc-100">£4.95 GBP</div>
            <p className="text-xs text-zinc-500">Royal Mail 24/48 Tracked service with SMS and email delivery notification.</p>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Worldwide &amp; USA Tracked</h4>
            <div className="font-mono text-xl font-black text-[var(--color-brand-navy)] dark:text-zinc-100">£15.00 GBP</div>
            <p className="text-xs text-zinc-500">Royal Mail International Tracked with full door-to-door tracking milestones.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Discreet Packaging Commitment</h2>
        <p>
          To maintain confidentiality and scientific integrity, all orders are shipped in plain, durable, unmarked cardboard boxes. The external shipping label contains only required courier barcoding, delivery address, and return address. <strong>Zero product names, compound designations, or peptide logos appear on the exterior packaging.</strong> PEPTECH branding and serialized Device Passports remain strictly inside the package.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Temperature-Sensitive Compound Handling</h2>
        <p>
          Pre-filled cartridges and lyophilised vials are packed with thermal protective insulation where required. While freeze-dried peptides maintain stability at ambient temperatures during typical transit periods, compounds should be transferred to 2°C–8°C laboratory refrigeration immediately upon receipt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Returns &amp; Replacement Policy</h2>
        <p>
          Due to the chemical, temperature-sensitive, and sterile nature of research peptide materials:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li><strong>Faulty or Damaged Goods</strong>: If an item arrives damaged in transit or defective, notify us within 48 hours of delivery at <a href="mailto:info@peptech.bio" className="underline text-[var(--color-brand-teal)]">info@peptech.bio</a> with photographic evidence for an immediate replacement.</li>
          <li><strong>Unopened Non-Compromised Returns</strong>: Unopened Complete Pen Sets with intact tamper-evident seals may be returned within 14 days of delivery.</li>
          <li><strong>Compromised Compounds</strong>: Vials or cartridges where the sterile seal has been broken or exposed cannot be accepted for return due to contamination and safety protocols.</li>
        </ul>
      </section>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        To request assistance with an active shipment: <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] underline">info@peptech.bio</a>.
      </div>
    </main>
  )
}
