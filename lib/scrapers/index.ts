import { MOCK_CATALOG } from "./mock-catalog"
import type { Platform, ProductResult, Scraper } from "./types"
import { matchScore } from "../matching"

export * from "./types"
export { PLATFORMS, PLATFORM_LIST } from "./platforms"
export { SUGGESTED_ITEMS } from "./mock-catalog"

/**
 * Mock scraper. Filters the static catalog using fuzzy matching + keyword overlap and simulates
 * network latency + occasional variance. Swap this class out with a real
 * Playwright/HTTP scraper that returns `ProductResult[]` and nothing else
 * in the app needs to change.
 */
class MockScraper implements Scraper {
  constructor(public platform: Platform) {}

  async searchProducts(query: string, _pincode: string): Promise<ProductResult[]> {
    // Simulate real-world request latency (80-260ms).
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 180))

    const entries = MOCK_CATALOG[this.platform]
    const queryLower = query.toLowerCase().trim()

    return entries
      .map((entry, i) => {
        const { keywords, ...rest } = entry
        const dummyProduct: ProductResult = {
          ...rest,
          platform: this.platform,
          productId: `${this.platform}-${query}-${i}`.replace(/\s+/g, "-").toLowerCase(),
        }
        const score = matchScore(query, dummyProduct)
        const keywordHit = keywords.some((k) => k.includes(queryLower) || queryLower.includes(k))
        return { product: dummyProduct, score: keywordHit ? score + 1.0 : score }
      })
      .filter(({ score }) => score >= 1.0)
      .map(({ product }) => product)
  }
}

/**
 * HTTP Scraper that delegates to the FastAPI scraper microservice when available.
 */
class HttpScraper implements Scraper {
  constructor(public platform: Platform, private serviceUrl: string) {}

  async searchProducts(query: string, pincode: string): Promise<ProductResult[]> {
    try {
      const res = await fetch(`${this.serviceUrl}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pincode, platforms: [this.platform] }),
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) throw new Error(`FastAPI responded with ${res.status}`)
      const data = await res.json()
      return (data.results ?? []) as ProductResult[]
    } catch {
      // Graceful fallback to local mock catalog on timeout or failure
      return new MockScraper(this.platform).searchProducts(query, pincode)
    }
  }
}

const serviceUrl = process.env.SCRAPER_SERVICE_URL?.trim()

// The registry used by the API. Connects to FastAPI when SCRAPER_SERVICE_URL is configured,
// otherwise uses local fuzzy mock catalog.
export const scrapers: Scraper[] = serviceUrl
  ? [
      new HttpScraper("blinkit", serviceUrl),
      new HttpScraper("zepto", serviceUrl),
      new HttpScraper("instamart", serviceUrl),
      new HttpScraper("flipkart", serviceUrl),
      new HttpScraper("dmart", serviceUrl),
    ]
  : [
      new MockScraper("blinkit"),
      new MockScraper("zepto"),
      new MockScraper("instamart"),
      new MockScraper("flipkart"),
      new MockScraper("dmart"),
    ]

/** Fan out a single query to every platform in parallel. */
export async function searchAllPlatforms(query: string, pincode: string): Promise<ProductResult[]> {
  const results = await Promise.all(
    scrapers.map(async (s) => {
      try {
        return await s.searchProducts(query, pincode)
      } catch {
        return [] as ProductResult[]
      }
    }),
  )
  return results.flat()
}

