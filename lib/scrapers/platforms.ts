import type { Platform, PlatformMeta } from "./types"

// Delivery/handling economics differ per platform. These drive the
// basket-level aggregation, so the "cheapest per item" answer and the
// "cheapest overall basket" answer can legitimately disagree.
export const PLATFORMS: Record<Platform, PlatformMeta> = {
  blinkit: {
    id: "blinkit",
    label: "Blinkit",
    deliveryFee: 25,
    freeDeliveryAbove: 199,
    handlingFee: 4,
  },
  zepto: {
    id: "zepto",
    label: "Zepto",
    deliveryFee: 20,
    freeDeliveryAbove: 149,
    handlingFee: 5,
  },
  instamart: {
    id: "instamart",
    label: "Swiggy Instamart",
    deliveryFee: 30,
    freeDeliveryAbove: 99,
    handlingFee: 2,
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)
