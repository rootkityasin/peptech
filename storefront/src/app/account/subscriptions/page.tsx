"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Unified Subscriptions Route:
 * Redirects to the dynamic customer subscriptions dashboard inside /account?tab=subscriptions.
 * Prevents any isolated or static mock subscription views from rendering.
 */
export default function SubscriptionsDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/account?tab=subscriptions")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#16a6a3] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#0b1f3a]">
          Loading dynamic research subscription dashboard...
        </span>
      </div>
    </div>
  )
}
