import React from "react"
import Link from "next/link"

const faqs = [
  {
    q: "What is the difference between Complete Pen Sets, Refill Cartridges, and Freeze-Dried Vials?",
    a: "The Complete Pen Set is designed for first-time researchers who need the reusable precision aluminum pen hardware, a prefilled cartridge, needles, and a device passport. Refill Cartridges are prefilled replacement units specifically built for that reusable pen. Freeze-Dried Vials are traditional laboratory lyophilised vials for researchers with existing vial dissolution workflows."
  },
  {
    q: "Are Complete Pen Sets available on subscription?",
    a: "No. Complete Pen Sets are strictly one-time purchases because the aluminum precision pen is durable and reusable for long-term laboratory trials. When your cartridge is finished, you simply reorder Refill Cartridges, which ARE available on a 28-day Subscribe & Save discount (10% off)."
  },
  {
    q: "How does the 28-day Subscribe & Save work?",
    a: "Available on Refill Cartridges and Freeze-Dried Vials, Subscribe & Save automatically renews and dispatches your selected compound every 28 days with an automatic 10% discount. You can pause, skip an upcoming delivery, change your renewal date, or cancel at any time directly through your account dashboard without contacting support."
  },
  {
    q: "What couriers do you use and how fast is delivery?",
    a: "All orders are dispatched via Royal Mail Tracked. UK delivery is £4.95 with full tracking attached. Worldwide and USA delivery is £15.00 via Royal Mail International Tracked. Orders placed before 2:00 PM GMT ship the same business day."
  },
  {
    q: "Is packaging discreet?",
    a: "Yes. All shipments are packed in plain, unbranded protective cardboard outer boxes. There is zero peptide or PEPTECH branding on the external box. Brand packaging and device passports remain strictly inside."
  },
  {
    q: "Where do I find the Certificate of Analysis (COA) for my compound?",
    a: "You can visit our central /lab-reports page to search any batch number, or scan the packaging QR code on your product box to instantly inspect the third-party HPLC and Mass Spectrometry report on your mobile phone."
  },
  {
    q: "What are the storage guidelines for PEPTECH compounds?",
    a: "Freeze-dried lyophilised vials should be stored at 2°C to 8°C or frozen at -20°C for long-term stability, protected from direct UV light. Prefilled pen cartridges should be kept refrigerated at 2°C to 8°C in their protective case."
  },
  {
    q: "Are these products for human or clinical consumption?",
    a: "STRICTLY NO. All PEPTECH® compounds, cartridges, and materials are intended exclusively for in-vitro scientific research, laboratory experimentation, and educational purposes. Any human, clinical, diagnostic, or veterinary use is strictly prohibited."
  }
]

export default function HowItWorksPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] text-xs font-bold font-mono">
          <span>THE PEPTECH HARDWARE ECOSYSTEM</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          How The System Works
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Our reusable precision delivery system was created to bridge laboratory durability with repeatable scientific accuracy.
        </p>
      </div>

      {/* Visual 3 Steps In-Depth */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 relative shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-lg font-bold">1. Order Your Complete Pen Set</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              First-time trialists order a Complete Pen Set. You receive the precision aluminum pen body, your selected prefilled cartridge, 31G 5mm sterile needles, and your serialized Device Passport.
            </p>
            <div className="pt-2">
              <Link href="/pen-sets" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Explore Pen Sets →
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 relative shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-lg font-bold">2. Keep Your Reusable Pen</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Do not discard the pen body. The durable metal chassis is calibrated for thousands of trial cycles. Simply unscrew the exhausted cartridge and wipe down the sleeve with the included prep pads.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600">
              ✓ Multi-year hardware lifespan
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 relative shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-lg font-bold">3. Reorder Compatible Refills</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Whenever you require replacement compounds, visit the Refill Cartridges section. Each cartridge snaps smoothly into your pen. Subscribe every 28 days for automated delivery and 10% savings.
            </p>
            <div className="pt-2">
              <Link href="/refills" className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline">
                Explore Refill Cartridges →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive FAQs Section */}
      <div className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Answers regarding compatibility, 28-day subscriptions, Royal Mail dispatch, and lab testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2"
            >
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{faq.q}</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact Footer */}
      <div className="p-8 rounded-3xl bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
        <h3 className="font-bold text-base">Have Additional Questions?</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Our scientific support desk responds to all research inquiries within one business day Monday through Friday.
        </p>
        <div>
          <a
            href="mailto:info@peptech.bio"
            className="px-6 py-2.5 rounded-xl bg-[var(--color-brand-navy)] text-white text-xs font-bold inline-block hover:bg-[var(--color-brand-slate)] transition-colors"
          >
            Email info@peptech.bio
          </a>
        </div>
      </div>

    </main>
  )
}
