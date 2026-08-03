import type { Platform, ProductResult, Unit } from "./types"

// A realistic-ish mock catalog for Mumbai (pincode 400001).
// Prices/pack-sizes intentionally vary across platforms so that
// per-unit normalization and basket aggregation actually matter.

type CatalogEntry = Omit<ProductResult, "platform" | "productId"> & {
  /** search tokens this product should match on */
  keywords: string[]
}

type PlatformCatalog = Record<Platform, CatalogEntry[]>

function p(
  name: string,
  brand: string,
  price: number,
  mrp: number,
  quantity: number,
  unit: Unit,
  etaMinutes: number,
  keywords: string[],
  inStock = true,
): CatalogEntry {
  return { name, brand, price, mrp, quantity, unit, etaMinutes, inStock, keywords }
}

export const MOCK_CATALOG: PlatformCatalog = {
  blinkit: [
    p("Amul Taaza Toned Milk", "Amul", 33, 34, 500, "ml", 11, ["milk", "amul", "toned"]),
    p("Amul Gold Full Cream Milk", "Amul", 44, 45, 500, "ml", 11, ["milk", "amul", "full", "cream"]),
    p("Britannia Whole Wheat Bread", "Britannia", 55, 60, 400, "g", 12, ["bread", "britannia", "wheat"]),
    p("Farm Fresh Eggs", "Licious", 84, 99, 6, "pc", 14, ["eggs", "egg"]),
    p("Fresh Robusta Banana", "Fresho", 39, 49, 500, "g", 13, ["banana", "bananas"]),
    p("Maggi 2-Minute Noodles", "Nestle", 14, 14, 70, "g", 10, ["maggi", "noodles", "nestle"]),
    p("Tata Salt", "Tata", 28, 30, 1, "kg", 12, ["salt", "tata"]),
    p("Aashirvaad Atta", "Aashirvaad", 62, 70, 1, "kg", 12, ["atta", "flour", "wheat", "aashirvaad"]),
    p("Fortune Sunflower Oil", "Fortune", 155, 175, 1, "l", 15, ["oil", "sunflower", "fortune"]),
    p("Amul Butter", "Amul", 58, 62, 100, "g", 11, ["butter", "amul"]),
    p("Nescafe Classic Coffee", "Nescafe", 145, 160, 50, "g", 12, ["coffee", "nescafe"]),
    p("Onion", "Fresho", 33, 40, 1, "kg", 16, ["onion", "onions", "pyaaz"]),
    p("Tomato", "Fresho", 29, 35, 500, "g", 16, ["tomato", "tomatoes"]),
    p("Coca-Cola", "Coca-Cola", 40, 40, 750, "ml", 10, ["coke", "coca", "cola", "soft", "drink"]),
    p("Amul Masti Dahi Curd", "Amul", 27, 30, 400, "g", 11, ["curd", "dahi", "yogurt", "amul"]),
  ],
  zepto: [
    p("Amul Taaza Toned Milk", "Amul", 34, 34, 500, "ml", 9, ["milk", "amul", "toned"]),
    p("Amul Gold Full Cream Milk", "Amul", 43, 45, 500, "ml", 9, ["milk", "amul", "full", "cream"]),
    p("Britannia Brown Bread", "Britannia", 48, 55, 350, "g", 10, ["bread", "britannia", "brown"]),
    p("Fresh Eggs (Pack of 10)", "WellCurve", 115, 130, 10, "pc", 12, ["eggs", "egg"]),
    p("Fresh Banana", "Zepto", 44, 55, 500, "g", 11, ["banana", "bananas"]),
    p("Maggi Masala Noodles", "Nestle", 13, 14, 70, "g", 9, ["maggi", "noodles", "nestle"]),
    p("Tata Salt", "Tata", 27, 30, 1, "kg", 10, ["salt", "tata"]),
    p("Aashirvaad Atta", "Aashirvaad", 59, 70, 1, "kg", 10, ["atta", "flour", "wheat", "aashirvaad"]),
    p("Fortune Sunflower Oil", "Fortune", 149, 175, 1, "l", 13, ["oil", "sunflower", "fortune"]),
    p("Amul Butter", "Amul", 56, 62, 100, "g", 9, ["butter", "amul"]),
    p("Bru Instant Coffee", "Bru", 132, 150, 50, "g", 10, ["coffee", "bru"]),
    p("Onion", "Zepto", 30, 40, 1, "kg", 13, ["onion", "onions", "pyaaz"]),
    p("Tomato", "Zepto", 32, 38, 500, "g", 13, ["tomato", "tomatoes"]),
    p("Coca-Cola", "Coca-Cola", 38, 40, 750, "ml", 9, ["coke", "coca", "cola", "soft", "drink"]),
    p("Amul Masti Dahi Curd", "Amul", 28, 30, 400, "g", 9, ["curd", "dahi", "yogurt", "amul"]),
  ],
  instamart: [
    p("Amul Taaza Toned Milk", "Amul", 33, 34, 500, "ml", 13, ["milk", "amul", "toned"]),
    p("Mother Dairy Full Cream Milk", "Mother Dairy", 46, 47, 500, "ml", 13, ["milk", "full", "cream", "mother"]),
    p("Britannia Whole Wheat Bread", "Britannia", 52, 60, 400, "g", 14, ["bread", "britannia", "wheat"]),
    p("Farm Eggs (Pack of 12)", "Eggoz", 149, 168, 12, "pc", 16, ["eggs", "egg"]),
    p("Fresh Banana", "Instamart", 36, 45, 500, "g", 15, ["banana", "bananas"]),
    p("Maggi 2-Minute Noodles", "Nestle", 14, 14, 70, "g", 12, ["maggi", "noodles", "nestle"]),
    p("Tata Salt", "Tata", 29, 30, 1, "kg", 14, ["salt", "tata"]),
    p("Pillsbury Atta", "Pillsbury", 65, 72, 1, "kg", 14, ["atta", "flour", "wheat", "pillsbury"]),
    p("Fortune Sunflower Oil", "Fortune", 152, 175, 1, "l", 17, ["oil", "sunflower", "fortune"]),
    p("Amul Butter", "Amul", 57, 62, 100, "g", 13, ["butter", "amul"]),
    p("Nescafe Classic Coffee", "Nescafe", 149, 160, 50, "g", 14, ["coffee", "nescafe"]),
    p("Onion", "Instamart", 35, 42, 1, "kg", 18, ["onion", "onions", "pyaaz"]),
    p("Tomato", "Instamart", 27, 33, 500, "g", 18, ["tomato", "tomatoes"]),
    p("Thums Up", "Thums Up", 39, 40, 750, "ml", 12, ["coke", "cola", "soft", "drink", "thums"]),
    p("Amul Masti Dahi Curd", "Amul", 26, 30, 400, "g", 13, ["curd", "dahi", "yogurt", "amul"], false),
  ],
}

/** Suggested items shown in the UI to seed a shopping list. */
export const SUGGESTED_ITEMS = [
  "Milk",
  "Bread",
  "Eggs",
  "Banana",
  "Maggi",
  "Onion",
  "Tomato",
  "Atta",
  "Butter",
  "Curd",
  "Coffee",
  "Coke",
]
