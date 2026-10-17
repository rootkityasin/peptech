import path from "node:path"
import type { Plugin as EsbuildPlugin } from "esbuild"

// Medusa's built-in routes win over extension routes with the same URL.
// Resolve order pages and product variant edit to our source components instead.
// Never rewrite the installed dashboard or delete a running Vite cache.
export function adminOrderOverrides() {
  const dashboardDist = path.dirname(require.resolve("@medusajs/dashboard"))
  const ordersSourceDir = path.resolve(__dirname, "src/admin/components/orders")
  const productsSourceDir = path.resolve(__dirname, "src/admin/components/products")

  const resolveOverride = (source: string, importer?: string) => {
    if (!importer) return undefined

    // 1. Resolve order pages from dashboard dist
    if (source.includes("order-list-") && source.endsWith(".mjs") && importer.includes("@medusajs")) {
      return path.join(ordersSourceDir, "OrderList.jsx")
    }
    if (source.includes("order-detail-") && source.endsWith(".mjs") && importer.includes("@medusajs")) {
      return path.join(ordersSourceDir, "OrderDetail.jsx")
    }

    // 2. Resolve product variant edit drawer from dashboard dist
    if (source.includes("product-variant-edit-") && source.endsWith(".mjs") && importer.includes("@medusajs")) {
      return path.join(productsSourceDir, "ProductVariantEdit.jsx")
    }

    // 3. Resolve internal relative chunk imports from our custom components
    if (source.startsWith("./chunk-") && (
      importer.includes("ProductVariantEdit") ||
      importer.includes("OrderList") ||
      importer.includes("OrderDetail") ||
      importer.includes("src/admin/components") ||
      importer.includes("src\\admin\\components")
    )) {
      return path.join(dashboardDist, source)
    }

    return undefined
  }

  const optimizerPlugin: EsbuildPlugin = {
    name: "peptech-admin-source-overrides",
    setup(build) {
      build.onResolve(
        { filter: /^\.\/(order-(list|detail)|product-variant-edit)-[^/]+\.mjs$/ },
        ({ path: source, importer }) => {
          const file = resolveOverride(source, importer)
          if (!file) return
          return { path: `/@fs/${file.replace(/\\/g, "/")}`, external: true }
        }
      )
      build.onResolve(
        { filter: /^\.\/chunk-[^/]+\.mjs$/ },
        ({ path: source, importer }) => {
          const file = resolveOverride(source, importer)
          if (!file) return
          return { path: file }
        }
      )
    },
  }

  return {
    plugins: [{
      name: "peptech-admin-source-overrides",
      enforce: "pre" as const,
      resolveId(source: string, importer?: string) {
        return resolveOverride(source, importer)
      },
    }],
    optimizeDeps: {
      esbuildOptions: { plugins: [optimizerPlugin] },
    },
  }
}
