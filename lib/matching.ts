import type { ProductResult, Unit } from "./scrapers/types"

// --- Per-unit normalization -------------------------------------------------
// Different platforms sell different pack sizes (e.g. 6 vs 10 vs 12 eggs), so
// comparing sticker price alone is misleading. We normalize every product to a
// price-per-base-unit so quantities are actually comparable.

export type BaseUnit = "kg" | "l" | "pc"

const UNIT_TO_BASE: Record<Unit, { base: BaseUnit; factor: number }> = {
  g: { base: "kg", factor: 0.001 },
  kg: { base: "kg", factor: 1 },
  ml: { base: "l", factor: 0.001 },
  l: { base: "l", factor: 1 },
  pc: { base: "pc", factor: 1 },
}

export interface NormalizedProduct extends ProductResult {
  baseUnit: BaseUnit
  /** quantity expressed in the base unit (kg / l / pc) */
  baseQuantity: number
  /** price per base unit in INR */
  pricePerBaseUnit: number
}

export function normalize(product: ProductResult): NormalizedProduct {
  const { base, factor } = UNIT_TO_BASE[product.unit]
  const baseQuantity = product.quantity * factor
  return {
    ...product,
    baseUnit: base,
    baseQuantity,
    pricePerBaseUnit: baseQuantity > 0 ? product.price / baseQuantity : product.price,
  }
}

// --- Matching ---------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

/** Score how well a product matches a query (higher is better). */
function matchScore(query: string, product: ProductResult): number {
  const queryTokens = tokenize(query)
  const productTokens = new Set([...tokenize(product.name), ...tokenize(product.brand)])
  let hits = 0
  for (const t of queryTokens) if (productTokens.has(t)) hits++
  return hits
}

/**
 * From a platform's candidate products for one query item, choose the single
 * best representative match: strongest keyword match first, then cheapest by
 * per-unit price, preferring in-stock items.
 */
export function pickBestMatch(query: string, candidates: ProductResult[]): NormalizedProduct | null {
  if (candidates.length === 0) return null
  const scored = candidates.map((c) => ({ product: c, score: matchScore(query, c), norm: normalize(c) }))
  scored.sort((a, b) => {
    if (a.product.inStock !== b.product.inStock) return a.product.inStock ? -1 : 1
    if (b.score !== a.score) return b.score - a.score
    return a.norm.pricePerBaseUnit - b.norm.pricePerBaseUnit
  })
  return scored[0].norm
}
