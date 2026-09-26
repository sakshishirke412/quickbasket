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

// --- Matching Engine --------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function singularize(word: string): string {
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y"
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2)
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1)
  return word
}

// Canonical synonym groups for common Indian grocery search terms
const SYNONYM_MAP: Record<string, string> = {
  // Vegetables & produce
  onion: "onion",
  onions: "onion",
  pyaaz: "onion",
  pyaz: "onion",
  kanda: "onion",
  potato: "potato",
  potatoes: "potato",
  aloo: "potato",
  alu: "potato",
  batata: "potato",
  tomato: "tomato",
  tomatoes: "tomato",
  tamatar: "tomato",
  ginger: "ginger",
  adrak: "ginger",
  garlic: "garlic",
  lehsun: "garlic",
  lasun: "garlic",
  chilli: "chilli",
  chillies: "chilli",
  chili: "chilli",
  mirchi: "chilli",
  coriander: "coriander",
  dhaniya: "coriander",
  kothmir: "coriander",
  lemon: "lemon",
  lemons: "lemon",
  nimbu: "lemon",
  banana: "banana",
  bananas: "banana",
  kela: "banana",
  apple: "apple",
  apples: "apple",
  seb: "apple",

  // Dairy & staples
  curd: "curd",
  dahi: "curd",
  yogurt: "curd",
  yoghurt: "curd",
  milk: "milk",
  doodh: "milk",
  dudh: "milk",
  bread: "bread",
  pav: "bread",
  bun: "bread",
  atta: "atta",
  flour: "atta",
  wheat: "atta",
  gehu: "atta",
  rice: "rice",
  chawal: "rice",
  oil: "oil",
  tel: "oil",
  butter: "butter",
  makhan: "butter",
  paneer: "paneer",
  cottage: "paneer",
  salt: "salt",
  namak: "salt",
  sugar: "sugar",
  chini: "sugar",
  shakkar: "sugar",
  tea: "tea",
  chai: "tea",
  patti: "tea",
  coffee: "coffee",
  egg: "egg",
  eggs: "egg",
  anda: "egg",
  ande: "egg",

  // Beverages & snacks
  coke: "coke",
  coca: "coke",
  cola: "coke",
  pepsi: "coke",
  thums: "coke",
  chips: "chips",
  crisps: "chips",
  wafer: "chips",
  wafers: "chips",
  maggi: "maggi",
  noodles: "maggi",
}

function canonicalToken(token: string): string {
  const norm = singularize(token)
  return SYNONYM_MAP[norm] ?? SYNONYM_MAP[token] ?? norm
}

/** Standard Levenshtein distance for fuzzy typo tolerance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const v0 = new Array(b.length + 1)
  const v1 = new Array(b.length + 1)
  for (let i = 0; i <= b.length; i++) v0[i] = i
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j]
  }
  return v1[b.length]
}

/** Specific product variant modifiers. */
const MODIFIER_GROUPS: string[][] = [
  ["toned", "gold", "cream", "full cream", "cow", "buffalo", "skimmed"],
  ["brown", "white", "whole wheat", "multigrain"],
  ["salted", "unsalted"],
  ["instant", "filter", "classic"],
  ["masala", "classic", "atta"],
]

/** Score similarity between a query token and a product token (0 to 1). */
function tokenSimilarity(q: string, p: string): number {
  if (q === p) return 1
  const cq = canonicalToken(q)
  const cp = canonicalToken(p)
  if (cq === cp) return 1

  // Substring match for tokens of length >= 4 (e.g. "nescafe" in "nescafe-classic")
  if ((q.length >= 4 && p.includes(q)) || (p.length >= 4 && q.includes(p))) {
    return 0.9
  }

  // Levenshtein fuzzy distance for typos
  const dist = levenshtein(q, p)
  if (q.length >= 4 && dist === 1) return 0.85
  if (q.length >= 6 && dist === 2) return 0.7
  return 0
}

/**
 * Score how well a candidate product matches the search query.
 * Considers token overlap, canonical synonyms, fuzzy distance, and variant modifier consistency.
 */
export function matchScore(query: string, product: ProductResult): number {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return 0

  const prodTextTokens = [...tokenize(product.name), ...tokenize(product.brand)]
  const pTokens = Array.from(new Set(prodTextTokens))

  let totalTokenScore = 0

  for (const qt of qTokens) {
    let maxSim = 0
    for (const pt of pTokens) {
      const sim = tokenSimilarity(qt, pt)
      if (sim > maxSim) maxSim = sim
    }
    totalTokenScore += maxSim
  }

  // Modifier specificity check
  let modifierBonus = 0
  const qLower = query.toLowerCase()
  const pLower = `${product.name} ${product.brand}`.toLowerCase()

  for (const group of MODIFIER_GROUPS) {
    const qInGroup = group.filter((mod) => qLower.includes(mod))
    const pInGroup = group.filter((mod) => pLower.includes(mod))

    if (qInGroup.length > 0) {
      const matched = qInGroup.some((mod) => pInGroup.includes(mod))
      if (matched) {
        modifierBonus += 2.0 // Boost for matching the specific variant requested
      } else if (pInGroup.length > 0) {
        modifierBonus -= 1.5 // Penalty for conflicting variant (e.g. asked for toned, got full cream)
      }
    }
  }

  const baseScore = (totalTokenScore / qTokens.length) * 5 + modifierBonus
  return Math.max(0, baseScore)
}

export interface MatchPreferences {
  brand?: string
  packSize?: string
}

/**
 * From a platform's candidate products for one query item, choose the single
 * best representative match: strongest match first, then cheapest by
 * per-unit price, preferring in-stock items.
 */
export function pickBestMatch(
  query: string,
  candidates: ProductResult[],
  preferences?: MatchPreferences,
): NormalizedProduct | null {
  if (candidates.length === 0) return null

  const prefBrand = preferences?.brand && preferences.brand !== "Any" ? preferences.brand.toLowerCase() : null
  const prefSize = preferences?.packSize ? preferences.packSize.toLowerCase() : null

  // Calculate scores with preference boosting
  const scored = candidates
    .map((c) => {
      let score = matchScore(query, c)

      // Brand preference boost / penalty
      if (prefBrand) {
        const prodBrand = (c.brand || "").toLowerCase()
        const prodName = (c.name || "").toLowerCase()
        if (prodBrand.includes(prefBrand) || prodName.includes(prefBrand)) {
          score += 8.0 // High boost for exact brand match
        } else {
          score -= 4.0 // Penalty for non-matching brand
        }
      }

      // Pack size preference boost
      if (prefSize) {
        const prodName = c.name.toLowerCase()
        const sizeTokens = prefSize.split(/\s+/).filter(Boolean)
        const matchedTokens = sizeTokens.filter((t) => prodName.includes(t))
        if (matchedTokens.length === sizeTokens.length) {
          score += 4.0
        }
      }

      return { product: c, score, norm: normalize(c) }
    })
    .filter((c) => c.score >= 0.8)

  if (scored.length === 0) return null

  scored.sort((a, b) => {
    // Prefer in-stock items
    if (a.product.inStock !== b.product.inStock) return a.product.inStock ? -1 : 1
    // Prefer higher match score
    const scoreDiff = b.score - a.score
    if (Math.abs(scoreDiff) > 0.4) return scoreDiff
    // When match quality is equivalent, pick cheaper per-unit price
    return a.norm.pricePerBaseUnit - b.norm.pricePerBaseUnit
  })

  return scored[0].norm
}

