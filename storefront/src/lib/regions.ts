import { getBackendUrl, PUBLISHABLE_KEY } from "@/lib/customer-api"

export interface StoreRegionCountry {
  iso_2?: string | null
  display_name?: string | null
  name?: string | null
}

export interface StoreRegion {
  id: string
  name: string
  currency_code: string
  countries?: StoreRegionCountry[] | null
}

export interface CountryOption {
  code: string
  name: string
  regionId: string
  regionName: string
  currencyCode: string
}

function displayCountryName(code: string, fallback?: string | null): string {
  if (fallback) return fallback
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" })
    return names.of(code.toUpperCase()) || code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

export function flattenRegionCountries(regions: StoreRegion[]): CountryOption[] {
  const seen = new Set<string>()
  const countries: CountryOption[] = []

  for (const region of regions) {
    for (const country of region.countries || []) {
      const code = country.iso_2?.trim().toUpperCase()
      if (!code || seen.has(code)) continue
      seen.add(code)
      countries.push({
        code,
        name: displayCountryName(code, country.display_name || country.name),
        regionId: region.id,
        regionName: region.name,
        currencyCode: region.currency_code.toUpperCase(),
      })
    }
  }

  return countries.sort((a, b) => {
    if (a.code === "GB") return -1
    if (b.code === "GB") return 1
    return a.name.localeCompare(b.name)
  })
}

export function findCountryByName(countries: CountryOption[], name: string): CountryOption | undefined {
  return countries.find((country) => country.name.toLowerCase() === name.toLowerCase())
}

export function findCountryByCode(countries: CountryOption[], code?: string | null): CountryOption | undefined {
  if (!code) return undefined
  return countries.find((country) => country.code.toLowerCase() === code.toLowerCase())
}

export function formatCountryCode(code?: string | null, countries: CountryOption[] = []): string {
  if (!code) return ""
  return findCountryByCode(countries, code)?.name || displayCountryName(code)
}

export async function fetchStoreRegions(): Promise<StoreRegion[]> {
  const pubKey = PUBLISHABLE_KEY
  const headers: Record<string, string> = {}
  if (pubKey) headers["x-publishable-api-key"] = pubKey

  const request = async (url: string) => {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || "Failed to retrieve Medusa regions.")
    }
    return Array.isArray(data?.regions) ? data.regions : []
  }

  const base = getBackendUrl()
  try {
    return await request(`${base}/store/regions?fields=id,name,currency_code,*countries`)
  } catch (error) {
    if (base) {
      return await request("/store/regions?fields=id,name,currency_code,*countries")
    }
    throw error
  }
}

export async function fetchCountryOptions(): Promise<CountryOption[]> {
  return flattenRegionCountries(await fetchStoreRegions())
}
