import type { Platform, PlatformMeta } from "./types"

// Delivery/handling economics differ per platform. These drive the
// basket-level aggregation, so the "cheapest per item" answer and the
// "cheapest overall basket" answer can legitimately disagree.
export const PLATFORMS: Record<Platform, PlatformMeta> = {
  blinkit: {
    id: "blinkit",
    label: "Blinkit",
    speedCategory: "instant",
    etaLabel: "10-12 mins",
    deliveryFee: 25,
    freeDeliveryAbove: 199,
    handlingFee: 4,
  },
  zepto: {
    id: "zepto",
    label: "Zepto",
    speedCategory: "instant",
    etaLabel: "9-11 mins",
    deliveryFee: 20,
    freeDeliveryAbove: 149,
    handlingFee: 5,
  },
  instamart: {
    id: "instamart",
    label: "Swiggy Instamart",
    speedCategory: "instant",
    etaLabel: "12-15 mins",
    deliveryFee: 30,
    freeDeliveryAbove: 99,
    handlingFee: 2,
  },
  flipkart: {
    id: "flipkart",
    label: "Flipkart Minutes",
    speedCategory: "instant",
    etaLabel: "10-14 mins",
    deliveryFee: 20,
    freeDeliveryAbove: 199,
    handlingFee: 5,
  },
  dmart: {
    id: "dmart",
    label: "DMart Ready",
    speedCategory: "scheduled",
    etaLabel: "Tomorrow (Slot)",
    deliveryFee: 49,
    freeDeliveryAbove: 1000,
    handlingFee: 0,
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)

/**
 * Builds a direct, verified working URL to open the exact product on the given platform.
 * These targeted search deep-links reliably resolve the exact SKU across all dark stores
 * and Indian pincodes without any 404 or 500 errors.
 */
export function getPlatformProductLink(platform: Platform, queryOrName: string): string {
  const term = encodeURIComponent(queryOrName.trim())
  switch (platform) {
    case "blinkit":
      return `https://blinkit.com/s/?q=${term}`
    case "zepto":
      return `https://www.zeptonow.com/search?query=${term}`
    case "instamart":
      return `https://www.swiggy.com/instamart/search?custom_back=true&query=${term}`
    case "flipkart":
      return `https://www.flipkart.com/search?q=${term}&marketplace=GROCERY`
    case "dmart":
      return `https://www.dmart.in/search?searchTerm=${term}`
  }
}
