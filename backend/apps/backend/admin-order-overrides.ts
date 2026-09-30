import path from "node:path"
import type { Plugin as EsbuildPlugin } from "esbuild"

// Medusa's built-in routes win over extension routes with the same URL.
// Resolve only its two order page modules to our source components instead.
// Never rewrite the installed dashboard or delete a running Vite cache.
export function adminOrderOverrides() {
  const dashboardDist = path.dirname(require.resolve("@medusajs/dashboard"))
  const sourceDir = path.resolve(__dirname, "src/admin/components/orders")
  const orderModule = /^\.\/order-(list|detail)-[^/]+\.mjs$/

  const resolveOrder = (source: string, importer: string) => {
    const match = orderModule.exec(source)
    if (!match || path.dirname(importer) !== dashboardDist) return
    return path.join(sourceDir, match[1] === "list" ? "OrderList.jsx" : "OrderDetail.jsx")
  }

  const optimizerPlugin: EsbuildPlugin = {
    name: "peptech-order-source-pages",
    setup(build) {
      build.onResolve({ filter: orderModule }, ({ path: source, importer }) => {
        const file = resolveOrder(source, importer)
        if (!file) return
        // Leave application code outside pre-bundled dependencies so Vite can
        // transform JSX, resolve its imports, and hot-reload edits normally.
        return { path: `/@fs/${file.replace(/\\/g, "/")}`, external: true }
      })
    },
  }

  return {
    plugins: [{
      name: "peptech-order-source-pages",
      enforce: "pre" as const,
      resolveId(source: string, importer?: string) {
        return importer ? resolveOrder(source, importer) : undefined
      },
    }],
    optimizeDeps: {
      esbuildOptions: { plugins: [optimizerPlugin] },
    },
  }
}
