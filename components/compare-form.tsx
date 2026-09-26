"use client"

import { useState } from "react"
import {
  MapPin,
  Plus,
  X,
  Search,
  Loader2,
  Minus,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATALOG_DEFINITIONS, type CatalogItemDefinition } from "@/lib/catalog-meta"
import { SUGGESTED_ITEMS } from "@/lib/scrapers/mock-catalog"
import { cn } from "@/lib/utils"

export interface DraftItem {
  query: string
  quantity: number
  brand?: string
  packSize?: string
}

const QUICK_PINCODES = [
  { city: "Mumbai", code: "400001" },
  { city: "Delhi", code: "110001" },
  { city: "Bengaluru", code: "560001" },
  { city: "Pune", code: "411001" },
]

const PRESET_BASKETS: { label: string; tag: string; emoji: string; items: DraftItem[] }[] = [
  {
    label: "Morning Breakfast",
    tag: "Instant 10m",
    emoji: "🍳",
    items: [
      { query: "Milk", quantity: 2, brand: "Amul", packSize: "500 ml" },
      { query: "Bread", quantity: 1, brand: "Britannia", packSize: "400 g" },
      { query: "Butter", quantity: 1, brand: "Amul", packSize: "100 g" },
      { query: "Eggs", quantity: 1, brand: "Eggoz", packSize: "6 pcs" },
    ],
  },
  {
    label: "Monthly Pantry",
    tag: "DMart Saver",
    emoji: "🛒",
    items: [
      { query: "Atta", quantity: 1, brand: "Aashirvaad", packSize: "5 kg" },
      { query: "Basmati Rice", quantity: 1, brand: "India Gate", packSize: "5 kg" },
      { query: "Cooking Oil", quantity: 2, brand: "Fortune", packSize: "1 L" },
      { query: "Toor Dal", quantity: 2, brand: "Tata Sampann", packSize: "1 kg" },
      { query: "Sugar", quantity: 1, brand: "Madhur", packSize: "1 kg" },
      { query: "Salt", quantity: 1, brand: "Tata", packSize: "1 kg" },
    ],
  },
  {
    label: "Tea & Snacks",
    tag: "Chai Time",
    emoji: "☕",
    items: [
      { query: "Tea / Chai", quantity: 1, brand: "Red Label", packSize: "500 g" },
      { query: "Milk", quantity: 2, brand: "Amul", packSize: "500 ml" },
      { query: "Biscuits", quantity: 2, brand: "Britannia Good Day", packSize: "Standard Pack" },
      { query: "Maggi Noodles", quantity: 1, brand: "Nestle Maggi", packSize: "Pack of 4 (280g)" },
    ],
  },
]

interface CompareFormProps {
  onCompare: (pincode: string, items: DraftItem[]) => void
  loading: boolean
}

export function CompareForm({ onCompare, loading }: CompareFormProps) {
  const [pincode, setPincode] = useState("400001")
  const [items, setItems] = useState<DraftItem[]>([
    { query: "Milk", quantity: 2, brand: "Amul", packSize: "500 ml" },
    { query: "Bread", quantity: 1, brand: "Britannia", packSize: "400 g" },
    { query: "Eggs", quantity: 1, brand: "Eggoz", packSize: "6 pcs" },
  ])
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  // Selected item configuration drawer
  const [selectedDefinition, setSelectedDefinition] = useState<CatalogItemDefinition | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string>("Any")
  const [selectedPackSize, setSelectedPackSize] = useState<string>("")
  const [addQty, setAddQty] = useState(1)

  // Autocomplete matching items from CATALOG_DEFINITIONS + SUGGESTED_ITEMS
  const matchedSuggestions =
    input.trim().length >= 1
      ? CATALOG_DEFINITIONS.filter((def) =>
          def.name.toLowerCase().includes(input.trim().toLowerCase()),
        ).slice(0, 6)
      : []

  function openConfigurator(def: CatalogItemDefinition) {
    setSelectedDefinition(def)
    setSelectedBrand(def.defaultBrand || "Any")
    setSelectedPackSize(def.defaultPackSize || (def.packSizes[0]?.label ?? ""))
    setAddQty(1)
    setInput("")
    setShowSuggestions(false)
  }

  function commitConfiguredItem() {
    if (!selectedDefinition) return
    const query = selectedDefinition.name
    const existingIndex = items.findIndex(
      (i) =>
        i.query.toLowerCase() === query.toLowerCase() &&
        i.brand === selectedBrand &&
        i.packSize === selectedPackSize,
    )

    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + addQty } : it,
        ),
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          query,
          quantity: addQty,
          brand: selectedBrand,
          packSize: selectedPackSize,
        },
      ])
    }

    setSelectedDefinition(null)
  }

  function addRawItem(rawName: string) {
    const trimmed = rawName.trim()
    if (!trimmed) return
    // Check if matches known definition
    const matchedDef = CATALOG_DEFINITIONS.find(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase(),
    )
    if (matchedDef) {
      openConfigurator(matchedDef)
      return
    }

    // Otherwise add as custom freeform item
    if (items.some((i) => i.query.toLowerCase() === trimmed.toLowerCase())) {
      setInput("")
      setShowSuggestions(false)
      return
    }
    setItems((prev) => [...prev, { query: trimmed, quantity: 1 }])
    setInput("")
    setShowSuggestions(false)
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  function setQty(index: number, delta: number) {
    setItems((prev) =>
      prev.map((i, idx) =>
        idx === index ? { ...i, quantity: Math.min(20, Math.max(1, i.quantity + delta)) } : i,
      ),
    )
  }

  function handleSubmit() {
    setError(null)
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a valid 6-digit Indian pincode.")
      return
    }
    if (items.length === 0) {
      setError("Add at least one item to your basket.")
      return
    }
    onCompare(pincode.trim(), items)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/85 p-5 shadow-xl backdrop-blur-xl transition-all sm:p-6">
      {/* Aesthetic ambient card glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Pincode & City selector */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="pincode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Delivery Pincode
          </label>
          <span className="text-[11px] text-muted-foreground">5-platform serviceability</span>
        </div>
        <div className="relative mb-2">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            placeholder="400001"
            className="h-11 w-full rounded-2xl border border-input/80 bg-background/70 pl-9 pr-3 text-sm font-semibold tabular-nums text-foreground outline-none ring-primary/40 backdrop-blur transition focus:border-primary focus:ring-2"
          />
        </div>
        {/* Quick city presets */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PINCODES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setPincode(c.code)}
              className={cn(
                "rounded-lg px-2 py-0.5 text-[11px] font-medium transition",
                pincode === c.code
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {c.city}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Preset Baskets */}
      <div className="mb-5 border-t border-border/50 pt-4">
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3 text-amber-500" />
          Instant Preset Baskets
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRESET_BASKETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setItems(preset.items)}
              className="group flex flex-col items-start rounded-2xl border border-border/70 bg-background/60 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-base">{preset.emoji}</span>
                <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {preset.tag}
                </span>
              </div>
              <div className="mt-1 font-bold text-xs text-foreground group-hover:text-primary">
                {preset.label}
              </div>
              <div className="text-[10px] text-muted-foreground">{preset.items.length} items</div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Items Input */}
      <div className="mb-4 border-t border-border/50 pt-4">
        <label htmlFor="item" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Add Groceries with Brand & Quantity
        </label>
        <div className="relative mb-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="item"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setShowSuggestions(true)
                setActiveSuggestion(-1)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 250)
              }}
              onKeyDown={(e) => {
                if (showSuggestions && matchedSuggestions.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setActiveSuggestion((prev) => (prev + 1) % matchedSuggestions.length)
                    return
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setActiveSuggestion(
                      (prev) => (prev - 1 + matchedSuggestions.length) % matchedSuggestions.length,
                    )
                    return
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false)
                    return
                  }
                }
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  if (activeSuggestion >= 0 && activeSuggestion < matchedSuggestions.length) {
                    openConfigurator(matchedSuggestions[activeSuggestion])
                  } else {
                    addRawItem(input)
                  }
                }
              }}
              placeholder="Search e.g. Milk, Atta, Butter, Oil"
              className="h-11 w-full rounded-2xl border border-input/80 bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none ring-primary/40 backdrop-blur transition focus:border-primary focus:ring-2"
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && matchedSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-2xl border border-border/80 bg-popover/95 py-1.5 shadow-2xl backdrop-blur-xl">
                {matchedSuggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      openConfigurator(suggestion)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium transition",
                      idx === activeSuggestion
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-popover-foreground hover:bg-accent",
                    )}
                  >
                    <div>
                      <span className="font-semibold">{suggestion.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">({suggestion.category})</span>
                    </div>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Choose Brand & Size →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addRawItem(input)}
            className="h-11 shrink-0 rounded-2xl px-4 font-semibold shadow-xs"
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {/* Quick Item Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATALOG_DEFINITIONS.slice(0, 8).map((def) => (
            <button
              key={def.id}
              type="button"
              onClick={() => openConfigurator(def)}
              className="flex items-center gap-1 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-card"
            >
              <span>+ {def.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Brand & Pack Size Configurator Modal / Drawer */}
      {selectedDefinition && (
        <div className="mb-5 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-background p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">
                Configure {selectedDefinition.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDefinition(null)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Brand Selection */}
          <div className="mb-3">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Choose Brand:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedDefinition.brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition",
                    selectedBrand === brand
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border/80 bg-background/80 text-foreground hover:bg-accent",
                  )}
                >
                  {selectedBrand === brand && <Check className="size-3" />}
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Pack Size Selection */}
          <div className="mb-4">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Choose Pack Size:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedDefinition.packSizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => setSelectedPackSize(size.label)}
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition",
                    selectedPackSize === size.label
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "border border-border/80 bg-background/80 text-foreground hover:bg-accent",
                  )}
                >
                  {selectedPackSize === size.label && <Check className="size-3" />}
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Add CTA */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Quantity:</span>
              <div className="flex items-center rounded-xl border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                  className="grid size-8 place-items-center text-muted-foreground hover:bg-muted"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold tabular-nums">{addQty}</span>
                <button
                  type="button"
                  onClick={() => setAddQty((q) => Math.min(20, q + 1))}
                  className="grid size-8 place-items-center text-muted-foreground hover:bg-muted"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={commitConfiguredItem}
              className="h-9 rounded-xl px-4 text-xs font-bold shadow-sm"
            >
              Add {selectedBrand !== "Any" ? selectedBrand : ""} {selectedDefinition.name}
            </Button>
          </div>
        </div>
      )}

      {/* Selected Items Basket List */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Your Basket ({items.length} items)</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-[11px] font-medium text-muted-foreground hover:text-destructive"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-background/40 px-4 py-8 text-center">
            <ShoppingBag className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-semibold text-foreground">Your shopping list is empty</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Select items or pick a preset basket above
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div
                key={`${item.query}-${item.brand}-${item.packSize}-${idx}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3.5 py-2.5 transition hover:border-primary/40 hover:bg-background"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate text-xs font-bold text-foreground">{item.query}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    {item.brand && item.brand !== "Any" && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                        {item.brand}
                      </span>
                    )}
                    {item.packSize && (
                      <span className="rounded-md bg-secondary px-1.5 py-0.2 text-[10px] font-medium text-secondary-foreground">
                        {item.packSize}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-border/80 bg-muted/40">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(idx, -1)}
                      className="grid size-7 place-items-center text-muted-foreground hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(idx, 1)}
                      className="grid size-7 place-items-center text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.query}`}
                    onClick={() => removeItem(idx)}
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mb-3 text-xs font-semibold text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Compare Button */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/85 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Analyzing 5 Platforms…
          </>
        ) : (
          <>
            <Search className="size-4" />
            Compare Prices on 5 Platforms
          </>
        )}
      </Button>
    </div>
  )
}
