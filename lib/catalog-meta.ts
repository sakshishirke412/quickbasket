export interface PackSizeOption {
  label: string
  quantity: number
  unit: "g" | "kg" | "ml" | "l" | "pc"
}

export interface CatalogItemDefinition {
  id: string
  name: string
  category: "Dairy & Breakfast" | "Staples & Cooking" | "Snacks & Beverages" | "Fresh Produce"
  defaultBrand: string
  brands: string[]
  defaultPackSize: string
  packSizes: PackSizeOption[]
}

export const CATALOG_DEFINITIONS: CatalogItemDefinition[] = [
  {
    id: "milk",
    name: "Milk",
    category: "Dairy & Breakfast",
    defaultBrand: "Amul",
    brands: ["Any", "Amul", "Mother Dairy", "Nandini", "Nestle"],
    defaultPackSize: "500 ml",
    packSizes: [
      { label: "500 ml", quantity: 500, unit: "ml" },
      { label: "1 L", quantity: 1, unit: "l" },
    ],
  },
  {
    id: "atta",
    name: "Atta",
    category: "Staples & Cooking",
    defaultBrand: "Aashirvaad",
    brands: ["Any", "Aashirvaad", "Fortune", "Pillsbury"],
    defaultPackSize: "5 kg",
    packSizes: [
      { label: "1 kg", quantity: 1, unit: "kg" },
      { label: "5 kg", quantity: 5, unit: "kg" },
      { label: "10 kg", quantity: 10, unit: "kg" },
    ],
  },
  {
    id: "butter",
    name: "Butter",
    category: "Dairy & Breakfast",
    defaultBrand: "Amul",
    brands: ["Any", "Amul", "Mother Dairy", "Nutralite"],
    defaultPackSize: "100 g",
    packSizes: [
      { label: "100 g", quantity: 100, unit: "g" },
      { label: "500 g", quantity: 500, unit: "g" },
    ],
  },
  {
    id: "paneer",
    name: "Paneer",
    category: "Dairy & Breakfast",
    defaultBrand: "Amul",
    brands: ["Any", "Amul", "Mother Dairy", "Gowardhan"],
    defaultPackSize: "200 g",
    packSizes: [
      { label: "200 g", quantity: 200, unit: "g" },
      { label: "500 g", quantity: 500, unit: "g" },
    ],
  },
  {
    id: "curd",
    name: "Curd / Dahi",
    category: "Dairy & Breakfast",
    defaultBrand: "Amul",
    brands: ["Any", "Amul", "Mother Dairy", "Milky Mist"],
    defaultPackSize: "400 g",
    packSizes: [
      { label: "400 g", quantity: 400, unit: "g" },
      { label: "1 kg", quantity: 1, unit: "kg" },
    ],
  },
  {
    id: "oil",
    name: "Cooking Oil",
    category: "Staples & Cooking",
    defaultBrand: "Fortune",
    brands: ["Any", "Fortune", "Saffola", "Gemini", "Dhara"],
    defaultPackSize: "1 L",
    packSizes: [
      { label: "1 L", quantity: 1, unit: "l" },
      { label: "5 L", quantity: 5, unit: "l" },
    ],
  },
  {
    id: "rice",
    name: "Basmati Rice",
    category: "Staples & Cooking",
    defaultBrand: "India Gate",
    brands: ["Any", "India Gate", "Daawat", "Fortune"],
    defaultPackSize: "1 kg",
    packSizes: [
      { label: "1 kg", quantity: 1, unit: "kg" },
      { label: "5 kg", quantity: 5, unit: "kg" },
    ],
  },
  {
    id: "toor-dal",
    name: "Toor Dal",
    category: "Staples & Cooking",
    defaultBrand: "Tata Sampann",
    brands: ["Any", "Tata Sampann", "Fortune", "Organic Tattva"],
    defaultPackSize: "1 kg",
    packSizes: [
      { label: "500 g", quantity: 500, unit: "g" },
      { label: "1 kg", quantity: 1, unit: "kg" },
    ],
  },
  {
    id: "tea",
    name: "Tea / Chai",
    category: "Snacks & Beverages",
    defaultBrand: "Red Label",
    brands: ["Any", "Red Label", "Tata Tea Gold", "Taj Mahal", "Wagh Bakri"],
    defaultPackSize: "500 g",
    packSizes: [
      { label: "250 g", quantity: 250, unit: "g" },
      { label: "500 g", quantity: 500, unit: "g" },
    ],
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "Snacks & Beverages",
    defaultBrand: "Nescafe",
    brands: ["Any", "Nescafe", "Bru", "Continental"],
    defaultPackSize: "50 g",
    packSizes: [
      { label: "50 g", quantity: 50, unit: "g" },
      { label: "100 g", quantity: 100, unit: "g" },
    ],
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Dairy & Breakfast",
    defaultBrand: "Eggoz",
    brands: ["Any", "Eggoz", "Farm Fresh"],
    defaultPackSize: "6 pcs",
    packSizes: [
      { label: "6 pcs", quantity: 6, unit: "pc" },
      { label: "10 pcs", quantity: 10, unit: "pc" },
      { label: "12 pcs", quantity: 12, unit: "pc" },
    ],
  },
  {
    id: "bread",
    name: "Bread",
    category: "Dairy & Breakfast",
    defaultBrand: "Britannia",
    brands: ["Any", "Britannia", "English Oven", "Modern"],
    defaultPackSize: "400 g",
    packSizes: [{ label: "400 g", quantity: 400, unit: "g" }],
  },
  {
    id: "sugar",
    name: "Sugar",
    category: "Staples & Cooking",
    defaultBrand: "Madhur",
    brands: ["Any", "Madhur", "Trust"],
    defaultPackSize: "1 kg",
    packSizes: [
      { label: "1 kg", quantity: 1, unit: "kg" },
      { label: "5 kg", quantity: 5, unit: "kg" },
    ],
  },
  {
    id: "salt",
    name: "Salt",
    category: "Staples & Cooking",
    defaultBrand: "Tata",
    brands: ["Any", "Tata", "Aashirvaad", "Catch"],
    defaultPackSize: "1 kg",
    packSizes: [{ label: "1 kg", quantity: 1, unit: "kg" }],
  },
  {
    id: "maggi",
    name: "Maggi Noodles",
    category: "Snacks & Beverages",
    defaultBrand: "Nestle Maggi",
    brands: ["Nestle Maggi"],
    defaultPackSize: "Pack of 4 (280g)",
    packSizes: [
      { label: "Single (70g)", quantity: 70, unit: "g" },
      { label: "Pack of 4 (280g)", quantity: 280, unit: "g" },
    ],
  },
  {
    id: "biscuits",
    name: "Biscuits",
    category: "Snacks & Beverages",
    defaultBrand: "Britannia Good Day",
    brands: ["Any", "Britannia Good Day", "Parle-G", "Dark Fantasy"],
    defaultPackSize: "Standard Pack",
    packSizes: [{ label: "Standard Pack", quantity: 1, unit: "pc" }],
  },
]
