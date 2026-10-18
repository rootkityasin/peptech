import path from "node:path"
import type { Plugin as EsbuildPlugin } from "esbuild"

// Medusa's built-in routes win over extension routes with the same URL.
// Resolve order pages to our custom source components instead.
// Never rewrite the installed dashboard or delete a running Vite cache.
export function adminOrderOverrides() {
  const dashboardDist = path.dirname(require.resolve("@medusajs/dashboard"))
  const ordersSourceDir = path.resolve(__dirname, "src/admin/components/orders")
  const orderModule = /^\.\/order-(list|detail)-[^/]+\.mjs$/

  const resolveOverride = (source: string, importer?: string) => {
    if (!importer) return undefined

    // 1. Resolve order pages from dashboard dist
    const isOrder = orderModule.exec(source)
    if (isOrder && path.dirname(importer) === dashboardDist) {
      return path.join(ordersSourceDir, isOrder[1] === "list" ? "OrderList.jsx" : "OrderDetail.jsx")
    }

    return undefined
  }

  const optimizerPlugin: EsbuildPlugin = {
    name: "peptech-admin-source-overrides",
    setup(build) {
      build.onResolve(
        { filter: /^\.\/order-(list|detail)-[^/]+\.mjs$/ },
        ({ path: source, importer }) => {
          const file = resolveOverride(source, importer)
          if (!file) return
          return { path: `/@fs/${file.replace(/\\/g, "/")}`, external: true }
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
