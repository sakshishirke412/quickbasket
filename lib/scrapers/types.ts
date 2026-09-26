// Core data contract for the whole app.
// Real Playwright/HTTP scrapers just need to return `ProductResult[]`
// from `searchProducts()` and everything downstream keeps working.

export type Platform = "blinkit" | "zepto" | "instamart" | "flipkart" | "dmart"

export type Unit = "g" | "kg" | "ml" | "l" | "pc"

export interface ProductResult {
  platform: Platform
  productId: string
  name: string
  brand: string
  /** current selling price in INR */
  price: number
  /** listed MRP in INR (>= price) */
  mrp: number
  /** numeric pack size, e.g. 500 for "500 g" */
  quantity: number
  unit: Unit
  inStock: boolean
  /** delivery ETA in minutes */
  etaMinutes: number
  imageUrl?: string
  /** Direct link to the specific product on the platform's site */
  productUrl?: string
}

export interface PlatformMeta {
  id: Platform
  label: string
  /** delivery speed categorization */
  speedCategory: "instant" | "scheduled"
  /** human-friendly ETA text, e.g. "10 mins" or "Tomorrow" */
  etaLabel: string
  /** flat delivery fee in INR */
  deliveryFee: number
  /** order subtotal above which delivery is free */
  freeDeliveryAbove: number
  /** handling / small-cart fee in INR */
  handlingFee: number
}

/** A scraper takes a query + pincode and returns candidate products. */
export interface Scraper {
  platform: Platform
  searchProducts(query: string, pincode: string): Promise<ProductResult[]>
}
