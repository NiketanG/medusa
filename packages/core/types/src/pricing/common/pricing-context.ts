export type MedusaPricingContext = {
  region_id?: string
  currency_code?: string
  customer_id?: string
  customer?: {
    groups?: {
      id: string
    }[]
  }
}
