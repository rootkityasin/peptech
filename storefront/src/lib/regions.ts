import { medusa } from "./medusa"
import { useState, useEffect } from "react"

export interface StoreCountry {
  id: string
  iso_2: string
  iso_3?: string
  name: string
  display_name: string
  region_id: string
}

export interface StoreRegion {
  id: string
  name: string
  currency_code: string
  countries: StoreCountry[]
}

export interface RegionCountryOption {
  code: string // lowercase iso_2, e.g. "gb", "us", "de"
  name: string // display name e.g. "United Kingdom", "United States"
  regionId: string
  regionName: string
  currencyCode: string // uppercase currency, e.g. "GBP", "USD", "EUR"
}

// Fallback initial regions in case backend is loading or during Next.js SSR build
const FALLBACK_REGIONS: StoreRegion[] = [
  {
    id: "reg_01M2AQBJ9A89RTYJDP98PH1R6X",
    name: "United Kingdom (Domestic)",
    currency_code: "gbp",
    countries: [
      {
        id: "c_gb",
        iso_2: "gb",
        iso_3: "gbr",
        name: "UNITED KINGDOM",
        display_name: "United Kingdom",
        region_id: "reg_01M2AQBJ9A89RTYJDP98PH1R6X",
      },
    ],
  },
  {
    id: "reg_01M3EUROPE_EUR_UNION",
    name: "European Union (EUR)",
    currency_code: "eur",
    countries: [
      { id: "c_de", iso_2: "de", name: "GERMANY", display_name: "Germany", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_fr", iso_2: "fr", name: "FRANCE", display_name: "France", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_es", iso_2: "es", name: "SPAIN", display_name: "Spain", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_it", iso_2: "it", name: "ITALY", display_name: "Italy", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_nl", iso_2: "nl", name: "NETHERLANDS", display_name: "Netherlands", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_ie", iso_2: "ie", name: "IRELAND", display_name: "Ireland", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_be", iso_2: "be", name: "BELGIUM", display_name: "Belgium", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_at", iso_2: "at", name: "AUSTRIA", display_name: "Austria", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_se", iso_2: "se", name: "SWEDEN", display_name: "Sweden", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_dk", iso_2: "dk", name: "DENMARK", display_name: "Denmark", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_fi", iso_2: "fi", name: "FINLAND", display_name: "Finland", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_pt", iso_2: "pt", name: "PORTUGAL", display_name: "Portugal", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_pl", iso_2: "pl", name: "POLAND", display_name: "Poland", region_id: "reg_01M3EUROPE_EUR_UNION" },
      { id: "c_cz", iso_2: "cz", name: "CZECH REPUBLIC", display_name: "Czech Republic", region_id: "reg_01M3EUROPE_EUR_UNION" },
    ],
  },
  {
    id: "reg_01M3WORLD_USD_GLOBAL",
    name: "Worldwide & North America (USD)",
    currency_code: "usd",
    countries: [
      { id: "c_us", iso_2: "us", name: "UNITED STATES", display_name: "United States", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_ca", iso_2: "ca", name: "CANADA", display_name: "Canada", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_au", iso_2: "au", name: "AUSTRALIA", display_name: "Australia", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_ch", iso_2: "ch", name: "SWITZERLAND", display_name: "Switzerland", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_no", iso_2: "no", name: "NORWAY", display_name: "Norway", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_nz", iso_2: "nz", name: "NEW ZEALAND", display_name: "New Zealand", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_jp", iso_2: "jp", name: "JAPAN", display_name: "Japan", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_sg", iso_2: "sg", name: "SINGAPORE", display_name: "Singapore", region_id: "reg_01M3WORLD_USD_GLOBAL" },
      { id: "c_ae", iso_2: "ae", name: "UNITED ARAB EMIRATES", display_name: "United Arab Emirates", region_id: "reg_01M3WORLD_USD_GLOBAL" },
    ],
  },
]

let cachedRegions: StoreRegion[] | null = null
let cachedCountries: RegionCountryOption[] | null = null
let lastFetchedTime = 0
const CACHE_TTL_MS = 60 * 1000 // 1 minute in memory

export function mapRegionsToCountryOptions(regions: StoreRegion[]): RegionCountryOption[] {
  const options: RegionCountryOption[] = []

  for (const region of regions) {
    const currency = (region.currency_code || "gbp").toUpperCase()
    for (const country of region.countries || []) {
      const code = (country.iso_2 || "").toLowerCase()
      if (!code) continue
      const name = country.display_name || country.name || code.toUpperCase()
      options.push({
        code,
        name,
        regionId: region.id,
        regionName: region.name,
        currencyCode: currency,
      })
    }
  }

  // Sort with primary domestic markets first (e.g. GB), then alphabetically
  return options.sort((a, b) => {
    if (a.code === "gb") return -1
    if (b.code === "gb") return 1
    if (a.code === "us") return -1
    if (b.code === "us") return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Fetch all enabled regions with their countries from Medusa 2.0 Store API.
 */
export async function getRegions(forceRefresh = false): Promise<StoreRegion[]> {
  if (!forceRefresh && cachedRegions && Date.now() - lastFetchedTime < CACHE_TTL_MS) {
    return cachedRegions
  }

  try {
    const res = await medusa.store.region.list({
      fields: "id,name,currency_code,*countries",
      limit: 100,
    })

    const regions = (res.regions as unknown as StoreRegion[]) || []
    if (regions.length > 0) {
      cachedRegions = regions
      cachedCountries = mapRegionsToCountryOptions(regions)
      lastFetchedTime = Date.now()
      return regions
    }
  } catch (err) {
    console.warn("[Medusa 2.0] Failed to fetch live store regions:", err)
  }

  if (cachedRegions) return cachedRegions
  return FALLBACK_REGIONS
}

/**
 * Get all available country options directly derived from Medusa 2.0 regions.
 */
export async function getAvailableCountries(forceRefresh = false): Promise<RegionCountryOption[]> {
  if (!forceRefresh && cachedCountries && Date.now() - lastFetchedTime < CACHE_TTL_MS) {
    return cachedCountries
  }
  const regions = await getRegions(forceRefresh)
  const options = mapRegionsToCountryOptions(regions)
  cachedCountries = options
  return options
}

/**
 * Find country by 2-letter ISO code or full name from currently known options.
 */
export function getCountryByCode(code: string, countries?: RegionCountryOption[]): RegionCountryOption | undefined {
  const list = countries || cachedCountries || mapRegionsToCountryOptions(FALLBACK_REGIONS)
  const cleanCode = (code || "").trim().toLowerCase()
  return list.find((c) => c.code.toLowerCase() === cleanCode)
}

export function getCountryByName(name: string, countries?: RegionCountryOption[]): RegionCountryOption | undefined {
  const list = countries || cachedCountries || mapRegionsToCountryOptions(FALLBACK_REGIONS)
  const cleanName = (name || "").trim().toLowerCase()
  return (
    list.find((c) => c.name.toLowerCase() === cleanName) ||
    list.find((c) => c.code.toLowerCase() === cleanName) ||
    list[0]
  )
}

/**
 * React hook to access live Medusa 2.0 regions and enabled countries in UI components.
 */
export function useRegions() {
  const [regions, setRegions] = useState<StoreRegion[]>(() => cachedRegions || FALLBACK_REGIONS)
  const [countries, setCountries] = useState<RegionCountryOption[]>(() => cachedCountries || mapRegionsToCountryOptions(FALLBACK_REGIONS))
  const [isLoading, setIsLoading] = useState(!cachedRegions)

  useEffect(() => {
    let isMounted = true
    getRegions()
      .then((regs) => {
        if (isMounted) {
          setRegions(regs)
          setCountries(mapRegionsToCountryOptions(regs))
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn("[Medusa 2.0] useRegions load error:", err)
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    regions,
    countries,
    isLoading,
    refresh: () => getRegions(true),
  }
}
