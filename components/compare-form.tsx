"use client"

import { useState } from "react"
import { MapPin, Plus, X, Search, Loader2, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SUGGESTED_ITEMS } from "@/lib/scrapers/mock-catalog"
import { cn } from "@/lib/utils"

export interface DraftItem {
  query: string
  quantity: number
}

interface CompareFormProps {
  onCompare: (pincode: string, items: DraftItem[]) => void
  loading: boolean
}

export function CompareForm({ onCompare, loading }: CompareFormProps) {
  const [pincode, setPincode] = useState("400001")
  const [items, setItems] = useState<DraftItem[]>([
    { query: "Milk", quantity: 2 },
    { query: "Bread", quantity: 1 },
    { query: "Eggs", quantity: 1 },
  ])
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  function addItem(name: string) {
    const query = name.trim()
    if (!query) return
    if (items.some((i) => i.query.toLowerCase() === query.toLowerCase())) {
      setInput("")
      return
    }
    setItems((prev) => [...prev, { query, quantity: 1 }])
    setInput("")
  }

  function removeItem(query: string) {
    setItems((prev) => prev.filter((i) => i.query !== query))
  }

  function setQty(query: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.query === query ? { ...i, quantity: Math.min(20, Math.max(1, i.quantity + delta)) } : i,
      ),
    )
  }

  function handleSubmit() {
    setError(null)
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a valid 6-digit pincode.")
      return
    }
    if (items.length === 0) {
      setError("Add at least one item to your basket.")
      return
    }
    onCompare(pincode.trim(), items)
  }

  const remaining = SUGGESTED_ITEMS.filter(
    (s) => !items.some((i) => i.query.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {/* Pincode */}
      <label htmlFor="pincode" className="mb-2 block text-sm font-medium text-foreground">
        Delivery pincode
      </label>
      <div className="relative mb-6">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="pincode"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="400001"
          className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm tabular-nums outline-none ring-ring/50 transition focus:ring-2"
        />
      </div>

      {/* Add item */}
      <label htmlFor="item" className="mb-2 block text-sm font-medium text-foreground">
        Your shopping list
      </label>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="item"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                addItem(input)
              }
            }}
            placeholder="Add an item, e.g. Atta"
            className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring/50 transition focus:ring-2"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => addItem(input)}
          className="h-11 shrink-0 rounded-xl"
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Suggestions */}
      {remaining.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addItem(s)}
              className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition hover:border-primary/40 hover:bg-accent"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Selected items */}
      <div className="mb-5 flex flex-col gap-2">
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            Your basket is empty. Add items above.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.query}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
          >
            <span className="truncate text-sm font-medium text-foreground">{item.query}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  aria-label={`Decrease ${item.query} quantity`}
                  onClick={() => setQty(item.query, -1)}
                  className="grid size-7 place-items-center rounded-l-lg text-muted-foreground transition hover:bg-accent"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase ${item.query} quantity`}
                  onClick={() => setQty(item.query, 1)}
                  className="grid size-7 place-items-center rounded-r-lg text-muted-foreground transition hover:bg-accent"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${item.query}`}
                onClick={() => removeItem(item.query)}
                className="grid size-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-3 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className={cn("h-11 w-full rounded-xl text-sm font-semibold")}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Comparing prices…
          </>
        ) : (
          <>
            <Search className="size-4" />
            Compare {items.length} {items.length === 1 ? "item" : "items"}
          </>
        )}
      </Button>
    </div>
  )
}
