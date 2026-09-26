import type { Platform } from "./scrapers/types"

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function formatINR(value: number): string {
  return inr.format(Math.round(value))
}

export function formatUnit(quantity: number, unit: string): string {
  if (unit === "kg" && quantity < 1) return `${quantity * 1000} g`
  if (unit === "l" && quantity < 1) return `${quantity * 1000} ml`
  return `${quantity} ${unit}`
}

/** Static Tailwind classes per platform (kept static so JIT can see them). */
export const PLATFORM_STYLES: Record<
  Platform,
  { dot: string; chip: string; ring: string }
> = {
  blinkit: {
    dot: "bg-blinkit",
    chip: "bg-blinkit text-blinkit-foreground",
    ring: "ring-blinkit/40",
  },
  zepto: {
    dot: "bg-zepto",
    chip: "bg-zepto text-zepto-foreground",
    ring: "ring-zepto/40",
  },
  instamart: {
    dot: "bg-instamart",
    chip: "bg-instamart text-instamart-foreground",
    ring: "ring-instamart/40",
  },
  flipkart: {
    dot: "bg-flipkart",
    chip: "bg-flipkart text-flipkart-foreground",
    ring: "ring-flipkart/40",
  },
  dmart: {
    dot: "bg-dmart",
    chip: "bg-dmart text-dmart-foreground",
    ring: "ring-dmart/40",
  },
}
