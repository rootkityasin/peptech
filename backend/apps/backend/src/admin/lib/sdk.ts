import Medusa from "@medusajs/js-sdk"

declare const __BACKEND_URL__: string
declare const __AUTH_TYPE__: "jwt" | "session" | undefined
declare const __JWT_TOKEN_STORAGE_KEY__: string | undefined

const STORAGE_KEYS = ["peptech_admin_token", "medusa_auth_token", "_medusa_jwt"]

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  for (const key of STORAGE_KEYS) {
    const val = window.localStorage.getItem(key)
    if (val) return val
  }
  return null
}

export function syncStoredToken(token: string | null): void {
  if (typeof window === "undefined") return
  for (const key of STORAGE_KEYS) {
    if (token) {
      window.localStorage.setItem(key, token)
    } else {
      window.localStorage.removeItem(key)
    }
  }
}

// Use unified JWT auth synced across all known dashboard storage keys.
export const sdk = new Medusa({
  baseUrl: typeof __BACKEND_URL__ !== "undefined" && __BACKEND_URL__ ? __BACKEND_URL__ : "/",
  auth: {
    type: (typeof __AUTH_TYPE__ !== "undefined" && __AUTH_TYPE__) || "jwt",
    jwtTokenStorageMethod: "custom",
    storage: {
      getItem: () => getStoredToken(),
      setItem: (_k: string, val: string) => syncStoredToken(val),
      removeItem: () => syncStoredToken(null),
    },
  },
})

// Response-compatible fetch for custom admin routes and components.
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken()
  const headers = new Headers(init.headers)
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`)
  }
  const baseUrl = (typeof __BACKEND_URL__ !== "undefined" && __BACKEND_URL__) || (typeof window !== "undefined" ? window.location.origin : "")
  const fullUrl = url.startsWith("http") ? url : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
  return fetch(fullUrl, {
    ...init,
    headers,
    credentials: init.credentials || "include",
  })
}
