import Image from "next/image"
import Link from "next/link"
import { getProducts, type StoreProduct } from "@/lib/medusa"

export default async function HomePage() {
  const products = await getProducts({ limit: 4 })

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col">
      {/* Top Notice Bar */}
      <div className="bg-[var(--color-brand-slate)] text-white text-xs py-2 px-4 text-center font-mono tracking-wider">
        <span>RESEARCH GRADE PEPTIDES &amp; BIO-SOLUTIONS • SHOPIFY-STYLE ENGINE POWERED BY MEDUSA 2.0</span>
      </div>

      {/* Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <div className="relative h-9 w-36 bg-black px-2 py-1 rounded flex items-center justify-center">
                <Image
                  src="/logo.webp"
                  alt="PEPTECH"
                  width={140}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <Link href="#products" className="hover:text-[var(--color-brand-teal)] transition-colors">Catalog</Link>
              <Link href="#figma" className="hover:text-[var(--color-brand-teal)] transition-colors">Figma Integration</Link>
              <a
                href="http://localhost:9000/app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1"
              >
                <span>Admin Dashboard</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold">9000</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:9000/app"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-brand-slate)] hover:bg-[var(--color-brand-slate-dark)] text-white transition-all shadow-xs"
            >
              Open Medusa Admin ↗
            </a>
            <button className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 text-xs font-medium">
              <span>🛒</span>
              <span className="bg-[var(--color-brand-teal)] text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] border border-[var(--color-brand-teal)]/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand-teal)] animate-pulse"></span>
              <span>Shopify-Style Headless Architecture Ready</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Custom Figma Storefront for{" "}
              <span className="text-[var(--color-brand-teal)]">PEPTECH</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Your store is wired to Medusa 2.0 with the complete Shopify-style admin dashboard, product variants, inventory, and Stripe payment gateway.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="http://localhost:9000/app"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-lg bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Launch Shopify-Style Admin</span>
                <span>→</span>
              </a>
              <a
                href="#figma"
                className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-sm transition-all"
              >
                Figma Setup Guide
              </a>
            </div>
          </div>
        </section>

        {/* Live / Placeholder Products Section */}
        <section id="products" className="py-12 bg-[var(--color-brand-surface)] border-y border-zinc-200 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Product Catalog</h2>
                <p className="text-xs sm:text-sm text-zinc-500">Live products retrieved directly from your Medusa backend engine</p>
              </div>
              <span className="text-xs font-mono text-[var(--color-brand-teal)]">@medusajs/js-sdk</span>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product: StoreProduct) => (
                  <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl">
                      🧬
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{product.description || "High purity peptide formulation."}</p>
                      <button className="w-full mt-2 py-1.5 rounded-md bg-[var(--color-brand-slate)] text-white text-xs font-medium hover:bg-[var(--color-brand-slate-dark)] transition-colors">
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto space-y-3">
                <div className="text-3xl">📦</div>
                <h3 className="font-bold text-sm">No Products Created Yet</h3>
                <p className="text-xs text-zinc-500">
                  Connect your PostgreSQL database in <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">backend/.env</code>, open your admin dashboard at <span className="font-mono text-[var(--color-brand-teal)]">localhost:9000/app</span>, and create your first product or run the seed command.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Custom Figma Integration Blueprint */}
        <section id="figma" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold">How to Plug in Your Custom Figma Design</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Your backend handles all the complex Shopify commerce logic. Here is how your Figma UI connects:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-sm text-[var(--color-brand-teal)]">1. Figma Components</div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Paste your converted Figma components directly into <code className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">src/components/</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-sm text-[var(--color-brand-teal)]">2. Live Store Data</div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Call <code className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">getProducts()</code> or <code className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">medusa.store.cart.*</code> from <code className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">src/lib/medusa.ts</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-sm text-[var(--color-brand-teal)]">3. Checkout &amp; Stripe</div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Medusa handles the cart total, discounts, taxes, and initiates the Stripe payment session or Cash on Delivery automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} PEPTECH. All rights reserved. Self-hosted on Medusa 2.0.</p>
      </footer>
    </div>
  )
}
