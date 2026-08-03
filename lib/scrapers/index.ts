import { MOCK_CATALOG } from "./mock-catalog"
import type { Platform, ProductResult, Scraper } from "./types"

export * from "./types"
export { PLATFORMS, PLATFORM_LIST } from "./platforms"
export { SUGGESTED_ITEMS } from "./mock-catalog"

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Mock scraper. Filters the static catalog by keyword overlap and simulates
 * network latency + occasional variance. Swap this class out with a real
 * Playwright/HTTP scraper that returns `ProductResult[]` and nothing else
 * in the app needs to change.
 */
class MockScraper implements Scraper {
  constructor(public platform: Platform) {}

  async searchProducts(query: string, _pincode: string): Promise<ProductResult[]> {
    // Simulate real-world request latency (80-260ms).
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 180))

    const queryTokens = tokenize(query)
    const entries = MOCK_CATALOG[this.platform]

    return entries
      .filter((entry) => {
        const haystack = new Set([...entry.keywords, ...tokenize(entry.name), ...tokenize(entry.brand)])
        return queryTokens.some((t) => haystack.has(t))
      })
      .map((entry, i) => {
        const { keywords, ...rest } = entry
        return {
          ...rest,
          platform: this.platform,
          productId: `${this.platform}-${query}-${i}`.replace(/\s+/g, "-").toLowerCase(),
        } satisfies ProductResult
      })
  }
}

// The registry used by the API. To go live, replace these with real scrapers.
export const scrapers: Scraper[] = [
  new MockScraper("blinkit"),
  new MockScraper("zepto"),
  new MockScraper("instamart"),
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
