import { PLATFORMS } from "./scrapers/platforms"
import type { Platform } from "./scrapers/types"
import { pickBestMatch, type NormalizedProduct } from "./matching"

export interface BasketItem {
  /** the user's search term, e.g. "Milk" */
  query: string
  /** number of packs the user wants */
  quantity: number
}

export interface PlatformMatch {
  platform: Platform
  product: NormalizedProduct | null
  /** price * requested quantity, null when unavailable */
  lineTotal: number | null
  /** true when this platform is the cheapest for this item */
  isCheapest: boolean
}

export interface ItemComparison {
  query: string
  quantity: number
  matches: PlatformMatch[]
  cheapestPlatform: Platform | null
}

export interface PlatformBasket {
  platform: Platform
  label: string
  subtotal: number
  deliveryFee: number
  handlingFee: number
  total: number
  /** number of requested items available in stock on this platform */
  availableCount: number
  totalItems: number
  hasAllItems: boolean
}

export interface SplitCartLine {
  query: string
  quantity: number
  platform: Platform
  product: NormalizedProduct
  lineTotal: number
}

export interface SplitCart {
  lines: SplitCartLine[]
  /** subtotal per platform used in the split */
  perPlatformSubtotal: Record<string, number>
  itemsTotal: number
  feesTotal: number
  total: number
  platformsUsed: Platform[]
}

export interface ComparisonReport {
  pincode: string
  items: ItemComparison[]
  baskets: PlatformBasket[]
  /** cheapest single platform that stocks the whole list, if any */
  bestSinglePlatform: PlatformBasket | null
  /** cherry-picked cheapest-per-item cart */
  splitCart: SplitCart
  /** INR saved by splitting vs the cheapest single platform */
  splitSavings: number
}

type PlatformCandidates = Record<Platform, NormalizedProduct[]>

function fees(platform: Platform, subtotal: number): { deliveryFee: number; handlingFee: number } {
  const meta = PLATFORMS[platform]
  const deliveryFee = subtotal >= meta.freeDeliveryAbove || subtotal === 0 ? 0 : meta.deliveryFee
  const handlingFee = subtotal === 0 ? 0 : meta.handlingFee
  return { deliveryFee, handlingFee }
}

/**
 * Build the full comparison report from raw candidates.
 * `candidatesByItem[i]` holds each platform's best-matched product for item i.
 */
export function buildReport(
  pincode: string,
  items: BasketItem[],
  rawByItem: { query: string; quantity: number; candidates: PlatformCandidates }[],
): ComparisonReport {
  const platforms = Object.keys(PLATFORMS) as Platform[]

  // Per-item comparison across platforms.
  const itemComparisons: ItemComparison[] = rawByItem.map(({ query, quantity, candidates }) => {
    const matches: PlatformMatch[] = platforms.map((platform) => {
      const product = candidates[platform]?.[0] ?? null
      const available = product?.inStock ?? false
      return {
        platform,
        product,
        lineTotal: product && available ? product.price * quantity : null,
        isCheapest: false,
      }
    })

    let cheapestPlatform: Platform | null = null
    let cheapest = Number.POSITIVE_INFINITY
    for (const m of matches) {
      if (m.lineTotal != null && m.lineTotal < cheapest) {
        cheapest = m.lineTotal
        cheapestPlatform = m.platform
      }
    }
    for (const m of matches) m.isCheapest = m.platform === cheapestPlatform

    return { query, quantity, matches, cheapestPlatform }
  })

  // Per-platform full-basket totals.
  const baskets: PlatformBasket[] = platforms.map((platform) => {
    let subtotal = 0
    let availableCount = 0
    for (const item of itemComparisons) {
      const m = item.matches.find((x) => x.platform === platform)
      if (m?.lineTotal != null) {
        subtotal += m.lineTotal
        availableCount++
      }
    }
    const { deliveryFee, handlingFee } = fees(platform, subtotal)
    return {
      platform,
      label: PLATFORMS[platform].label,
      subtotal,
      deliveryFee,
      handlingFee,
      total: subtotal + deliveryFee + handlingFee,
      availableCount,
      totalItems: itemComparisons.length,
      hasAllItems: availableCount === itemComparisons.length && itemComparisons.length > 0,
    }
  })

  const bestSinglePlatform =
    baskets
      .filter((b) => b.hasAllItems)
      .sort((a, b) => a.total - b.total)[0] ?? null

  // Cherry-picked split cart: buy each item from its cheapest platform.
  const splitLines: SplitCartLine[] = []
  const perPlatformSubtotal: Record<string, number> = {}
  for (const item of itemComparisons) {
    if (!item.cheapestPlatform) continue
    const m = item.matches.find((x) => x.platform === item.cheapestPlatform)
    if (!m?.product || m.lineTotal == null) continue
    splitLines.push({
      query: item.query,
      quantity: item.quantity,
      platform: item.cheapestPlatform,
      product: m.product,
      lineTotal: m.lineTotal,
    })
    perPlatformSubtotal[item.cheapestPlatform] =
      (perPlatformSubtotal[item.cheapestPlatform] ?? 0) + m.lineTotal
  }

  const platformsUsed = Object.keys(perPlatformSubtotal) as Platform[]
  let feesTotal = 0
  for (const platform of platformsUsed) {
    const { deliveryFee, handlingFee } = fees(platform, perPlatformSubtotal[platform])
    feesTotal += deliveryFee + handlingFee
  }
  const itemsTotal = splitLines.reduce((s, l) => s + l.lineTotal, 0)

  const splitCart: SplitCart = {
    lines: splitLines,
    perPlatformSubtotal,
    itemsTotal,
    feesTotal,
    total: itemsTotal + feesTotal,
    platformsUsed,
  }

  const splitSavings = bestSinglePlatform ? bestSinglePlatform.total - splitCart.total : 0

  return {
    pincode,
    items: itemComparisons,
    baskets,
    bestSinglePlatform,
    splitCart,
    splitSavings,
  }
}
