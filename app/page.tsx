"use client"

import { useState } from "react"
import { ShoppingBasket, Zap, AlertCircle } from "lucide-react"
import { CompareForm, type DraftItem } from "@/components/compare-form"
import { ResultsView } from "@/components/results-view"
import { PlatformDot } from "@/components/platform-badge"
import type { ComparisonReport } from "@/lib/aggregate"

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ComparisonReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCompare(pincode: string, items: DraftItem[]) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.")
      setReport(data as ComparisonReport)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingBasket className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">QuickBasket</h1>
              <p className="text-sm text-muted-foreground">Quick-commerce grocery price comparison</p>
            </div>
          </div>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Build your shopping list and instantly compare the total across{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <PlatformDot platform="blinkit" /> Blinkit
            </span>
            ,{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <PlatformDot platform="zepto" /> Zepto
            </span>{" "}
            and{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <PlatformDot platform="instamart" /> Swiggy Instamart
            </span>
            . Per-unit pricing and delivery fees included.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CompareForm onCompare={handleCompare} loading={loading} />
        </div>

        <div>
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {report ? <ResultsView report={report} /> : <EmptyState loading={loading} />}
        </div>
      </div>
    </main>
  )
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Zap className={loading ? "size-6 animate-pulse" : "size-6"} />
        </span>
        <h2 className="text-base font-semibold text-foreground">
          {loading ? "Fetching live-style prices…" : "Your comparison will appear here"}
        </h2>
        <p className="text-pretty text-sm text-muted-foreground">
          {loading
            ? "Matching products and crunching per-unit prices across all three platforms."
            : "Add items to your basket and hit Compare to see the cheapest store and a smart split that saves the most."}
        </p>
      </div>
    </div>
  )
}
