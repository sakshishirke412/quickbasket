"use client"

import { useState } from "react"
import {
  ShoppingBasket,
  Zap,
  AlertCircle,
  Sparkles,
  Ruler,
  Truck,
  GitCompareArrows,
  Layers,
  ArrowRight,
} from "lucide-react"
import { CompareForm, type DraftItem } from "@/components/compare-form"
import { ResultsView } from "@/components/results-view"
import { PlatformDot } from "@/components/platform-badge"
import { ThemeToggle } from "@/components/theme-toggle"
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
    <main className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Sticky Aesthetic Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25">
              <ShoppingBasket className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-foreground">QuickBasket</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                  5 STORES
                </span>
              </div>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Instant 10-Min vs Scheduled DMart Price Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-xs">
              <Sparkles className="size-3.5 text-amber-500" />
              Live-calibrated pricing
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section with Ambient Glow */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card/60 via-card/25 to-background">
        {/* Aesthetic background gradients */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/3 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-14">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
            <Sparkles className="size-3.5 text-primary" />
            Compare 5 Grocery Apps Across Brands & Pack Sizes
          </div>

          <h1 className="max-w-3xl text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            One basket. 5 stores. See who&apos;s <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">actually cheapest</span>.
          </h1>

          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Choose your preferred brands and pack sizes. QuickBasket crunches delivered totals across{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PlatformDot platform="blinkit" /> Blinkit
            </span>
            ,{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PlatformDot platform="zepto" /> Zepto
            </span>
            ,{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PlatformDot platform="instamart" /> Swiggy Instamart
            </span>
            ,{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PlatformDot platform="flipkart" /> Flipkart Minutes
            </span>
            , and{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <PlatformDot platform="dmart" /> DMart Ready
            </span>
            .
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <FeatureChip icon={<Zap className="size-3.5 text-amber-500" />} label="Urgency Premium Analysis" />
            <FeatureChip icon={<Layers className="size-3.5 text-primary" />} label="Brand & Size Selectors" />
            <FeatureChip icon={<Truck className="size-3.5 text-primary" />} label="Delivered Fee Transparency" />
            <FeatureChip icon={<GitCompareArrows className="size-3.5 text-primary" />} label="Combinatorial Multi-Store Split" />
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[400px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <CompareForm onCompare={handleCompare} loading={loading} />
        </div>

        <div>
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-xs font-semibold text-destructive shadow-xs"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {report ? <ResultsView report={report} /> : <EmptyState loading={loading} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
          <p className="text-pretty">
            Built with a high-performance modular scraper interface — supporting Blinkit, Zepto,
            Swiggy Instamart, Flipkart Minutes, and DMart Ready.
          </p>
          <p>Educational demo · Authentic retail benchmarks calibrated for Indian metro pincodes.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur-md">
      {icon}
      {label}
    </span>
  )
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-xl">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
          <Zap className={loading ? "size-7 animate-pulse text-amber-500" : "size-7 text-primary"} />
        </span>
        <h2 className="text-base font-extrabold text-foreground sm:text-lg">
          {loading ? "Crunching live prices across 5 stores…" : "Your multi-store comparison will appear here"}
        </h2>
        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
          {loading
            ? "Matching specific brands and pack sizes across Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, and DMart Ready."
            : "Pick a quick preset basket on the left or customize your own brands and pack sizes, then hit Compare."}
        </p>
      </div>
    </div>
  )
}
