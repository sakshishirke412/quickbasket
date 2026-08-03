import { NextResponse } from "next/server"
import { searchAllPlatforms, type Platform, type ProductResult } from "@/lib/scrapers"
import { PLATFORMS } from "@/lib/scrapers/platforms"
import { pickBestMatch, type NormalizedProduct } from "@/lib/matching"
import { buildReport, type BasketItem } from "@/lib/aggregate"

const PLATFORM_IDS = Object.keys(PLATFORMS) as Platform[]
const MAX_ITEMS = 25

interface CompareBody {
  pincode?: string
  items?: { query?: string; quantity?: number }[]
}

function sanitizeItems(items: CompareBody["items"]): BasketItem[] {
  if (!Array.isArray(items)) return []
  const seen = new Set<string>()
  const out: BasketItem[] = []
  for (const raw of items) {
    const query = String(raw?.query ?? "").trim()
    if (!query) continue
    const key = query.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const qty = Number(raw?.quantity)
    const quantity = Number.isFinite(qty) ? Math.min(Math.max(Math.trunc(qty), 1), 20) : 1
    out.push({ query, quantity })
    if (out.length >= MAX_ITEMS) break
  }
  return out
}

export async function POST(request: Request) {
  let body: CompareBody
  try {
    body = (await request.json()) as CompareBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const pincode = String(body.pincode ?? "").trim()
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 })
  }

  const items = sanitizeItems(body.items)
  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one item to compare." }, { status: 400 })
  }

  // For each item, fan out to every platform and keep the best match per platform.
  const rawByItem = await Promise.all(
    items.map(async ({ query, quantity }) => {
      const all: ProductResult[] = await searchAllPlatforms(query, pincode)

      const candidates = {} as Record<Platform, NormalizedProduct[]>
      for (const platform of PLATFORM_IDS) {
        const forPlatform = all.filter((p) => p.platform === platform)
        const best = pickBestMatch(query, forPlatform)
        candidates[platform] = best ? [best] : []
      }

      return { query, quantity, candidates }
    }),
  )

  const report = buildReport(pincode, items, rawByItem)
  return NextResponse.json(report)
}
