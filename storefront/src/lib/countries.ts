export interface CountryOption {
  code: string // ISO 3166-1 alpha-2
  name: string
  dialCode: string
  currency: "GBP" | "USD" | "EUR"
  region: "UK" | "US" | "EU" | "INTL"
  zipLabel?: string
  hasStates?: boolean
}

export const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "District of Columbia" }
]

export const CA_PROVINCES = [
  { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" }, { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" }, { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" }, { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" }, { code: "ON", name: "Ontario" }, { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" }, { code: "YT", name: "Yukon" }
]

export const AU_STATES = [
  { code: "NSW", name: "New South Wales" }, { code: "VIC", name: "Victoria" },
  { code: "QLD", name: "Queensland" }, { code: "WA", name: "Western Australia" },
  { code: "SA", name: "South Australia" }, { code: "TAS", name: "Tasmania" },
  { code: "ACT", name: "Australian Capital Territory" }, { code: "NT", name: "Northern Territory" }
]

export const COUNTRIES: CountryOption[] = [
  // Primary markets first for user convenience
  { code: "GB", name: "United Kingdom", dialCode: "+44", currency: "GBP", region: "UK", zipLabel: "Postcode" },
  { code: "US", name: "United States", dialCode: "+1", currency: "USD", region: "US", zipLabel: "ZIP Code", hasStates: true },
  { code: "CA", name: "Canada", dialCode: "+1", currency: "USD", region: "INTL", zipLabel: "Postal Code", hasStates: true },
  { code: "DE", name: "Germany", dialCode: "+49", currency: "EUR", region: "EU", zipLabel: "Postcode" },
  { code: "FR", name: "France", dialCode: "+33", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "AU", name: "Australia", dialCode: "+61", currency: "USD", region: "INTL", zipLabel: "Postcode", hasStates: true },
  { code: "CH", name: "Switzerland", dialCode: "+41", currency: "EUR", region: "INTL", zipLabel: "Postcode" },
  { code: "NL", name: "Netherlands", dialCode: "+31", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "IE", name: "Ireland", dialCode: "+353", currency: "EUR", region: "EU", zipLabel: "Eircode" },
  { code: "IT", name: "Italy", dialCode: "+39", currency: "EUR", region: "EU", zipLabel: "CAP" },
  { code: "ES", name: "Spain", dialCode: "+34", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "SE", name: "Sweden", dialCode: "+46", currency: "EUR", region: "EU", zipLabel: "Postcode" },
  { code: "NO", name: "Norway", dialCode: "+47", currency: "EUR", region: "INTL", zipLabel: "Postcode" },
  { code: "DK", name: "Denmark", dialCode: "+45", currency: "EUR", region: "EU", zipLabel: "Postcode" },
  { code: "BE", name: "Belgium", dialCode: "+32", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "AT", name: "Austria", dialCode: "+43", currency: "EUR", region: "EU", zipLabel: "Postcode" },
  { code: "FI", name: "Finland", dialCode: "+358", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "PT", name: "Portugal", dialCode: "+351", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "PL", name: "Poland", dialCode: "+48", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", currency: "USD", region: "INTL", zipLabel: "Postcode" },
  { code: "JP", name: "Japan", dialCode: "+81", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "SG", name: "Singapore", dialCode: "+65", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "IL", name: "Israel", dialCode: "+972", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "KR", name: "South Korea", dialCode: "+82", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "GR", name: "Greece", dialCode: "+30", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "HU", name: "Hungary", dialCode: "+36", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "RO", name: "Romania", dialCode: "+40", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "SK", name: "Slovakia", dialCode: "+421", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "HR", name: "Croatia", dialCode: "+385", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "LT", name: "Lithuania", dialCode: "+370", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "SI", name: "Slovenia", dialCode: "+386", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "LV", name: "Latvia", dialCode: "+371", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "EE", name: "Estonia", dialCode: "+372", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "CY", name: "Cyprus", dialCode: "+357", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "MT", name: "Malta", dialCode: "+356", currency: "EUR", region: "EU", zipLabel: "Postal Code" },
  { code: "IS", name: "Iceland", dialCode: "+354", currency: "EUR", region: "INTL", zipLabel: "Postcode" },
  { code: "ZA", name: "South Africa", dialCode: "+27", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "BR", name: "Brazil", dialCode: "+55", currency: "USD", region: "INTL", zipLabel: "CEP" },
  { code: "MX", name: "Mexico", dialCode: "+52", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "CL", name: "Chile", dialCode: "+56", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "CO", name: "Colombia", dialCode: "+57", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "AR", name: "Argentina", dialCode: "+54", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "TW", name: "Taiwan", dialCode: "+886", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "TH", name: "Thailand", dialCode: "+66", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "MY", name: "Malaysia", dialCode: "+60", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "IN", name: "India", dialCode: "+91", currency: "USD", region: "INTL", zipLabel: "PIN Code" },
  { code: "ID", name: "Indonesia", dialCode: "+62", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "PH", name: "Philippines", dialCode: "+63", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "VN", name: "Vietnam", dialCode: "+84", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "QA", name: "Qatar", dialCode: "+974", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "KW", name: "Kuwait", dialCode: "+965", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "BH", name: "Bahrain", dialCode: "+973", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "OM", name: "Oman", dialCode: "+968", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "TR", name: "Turkey", dialCode: "+90", currency: "EUR", region: "INTL", zipLabel: "Postal Code" },
  { code: "EG", name: "Egypt", dialCode: "+20", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "MA", name: "Morocco", dialCode: "+212", currency: "EUR", region: "INTL", zipLabel: "Postal Code" },
  { code: "NG", name: "Nigeria", dialCode: "+234", currency: "USD", region: "INTL", zipLabel: "Postal Code" },
  { code: "KE", name: "Kenya", dialCode: "+254", currency: "USD", region: "INTL", zipLabel: "Postal Code" }
]

export function getCountryByCode(code: string): CountryOption {
  const match = COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase())
  return match || COUNTRIES[0] // fallback to UK
}

export function getCountryByName(name: string): CountryOption {
  const match = COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase())
  return match || COUNTRIES[0]
}
