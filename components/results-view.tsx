"use client"

import { useState } from "react"
import {
  Trophy,
  Split,
  Check,
  Ban,
  Store,
  TrendingDown,
  ExternalLink,
  Zap,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react"
import type { ComparisonReport, ItemComparison, PlatformBasket } from "@/lib/aggregate"
import { PLATFORMS, getPlatformProductLink } from "@/lib/scrapers/platforms"
import type { Platform } from "@/lib/scrapers/types"
import { formatINR, formatUnit } from "@/lib/format"
import { PlatformBadge, PlatformDot } from "@/components/platform-badge"
import { InsightsPanel } from "@/components/insights-panel"
import { PriceTrendChart } from "@/components/price-trend-chart"
import { cn } from "@/lib/utils"

type FilterCategory = "all" | "instant" | "scheduled"

export function ResultsView({ report }: { report: ComparisonReport }) {
  const [filter, setFilter] = useState<FilterCategory>("all")

  // Filtered platforms
  const visiblePlatforms: Platform[] = (Object.keys(PLATFORMS) as Platform[]).filter((p) => {
    if (filter === "instant") return PLATFORMS[p].speedCategory === "instant"
    if (filter === "scheduled") return PLATFORMS[p].speedCategory === "scheduled"
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Urgency Premium Banner if DMart is compared with instant delivery */}
      <UrgencyPremiumBanner report={report} />

      {/* Main Top Recommendations */}
      <RecommendationCards report={report} />

      {/* Analytics Insights */}
      <InsightsPanel insights={report.insights} />

      {/* Store Filter Tabs for 5 Platforms */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              filter === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All 5 Platforms
          </button>
          <button
            type="button"
            onClick={() => setFilter("instant")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
              filter === "instant"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Zap className="size-3 text-amber-500 fill-amber-500" />
            10-Min Instant (4)
          </button>
          <button
            type="button"
            onClick={() => setFilter("scheduled")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
              filter === "scheduled"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Calendar className="size-3 text-emerald-500" />
            Value / DMart Ready
          </button>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Comparing {visiblePlatforms.length} store{visiblePlatforms.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Store totals comparison */}
      <PlatformTotals report={report} visiblePlatforms={visiblePlatforms} />

      {/* Price Trend Chart over 14 days */}
      <PriceTrendChart trend={report.trend} />

      {/* Item-by-item breakdown with direct PDP product links */}
      <ItemBreakdown items={report.items} visiblePlatforms={visiblePlatforms} />

      <p className="text-pretty text-center text-xs text-muted-foreground">
        Prices reflect authentic Mumbai/Delhi retail benchmarks for pincode {report.pincode}. Delivery & handling fees
        are calculated per store policy. Click any product to open the exact product page.
      </p>
    </div>
  )
}

function UrgencyPremiumBanner({ report }: { report: ComparisonReport }) {
  const { insights } = report
  if (
    !insights.urgencyPremium ||
    insights.urgencyPremium <= 0 ||
    !insights.cheapestInstantPlatform ||
    !insights.cheapestInstantTotal ||
    !insights.dmartTotal
  ) {
    return null
  }

  const instantMeta = PLATFORMS[insights.cheapestInstantPlatform]
  const pctSavings = Math.round(
    (insights.urgencyPremium / insights.cheapestInstantTotal) * 100,
  )

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/90 to-emerald-500/10 p-5 shadow-lg backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-emerald-500/15 blur-2xl" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Urgency Premium Analysis
          </div>
          <h3 className="mt-1 text-base font-extrabold text-foreground sm:text-lg">
            Save {formatINR(insights.urgencyPremium)} ({pctSavings}%) with Scheduled Delivery
          </h3>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Need it in 10 minutes? <span className="font-semibold text-foreground">{instantMeta.label}</span> delivers this basket for{" "}
            <span className="font-bold text-foreground">{formatINR(insights.cheapestInstantTotal)}</span>. If you can
            wait for tomorrow&apos;s slot, <span className="font-semibold text-foreground">DMart Ready</span> cuts your total to{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(insights.dmartTotal)}
            </span>
            .
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-2xl border border-border/80 bg-card/90 px-3.5 py-2.5 text-center shadow-xs backdrop-blur">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Zap className="size-3 text-amber-500 fill-amber-500" />
              10-Min Rush
            </div>
            <div className="mt-0.5 text-base font-extrabold tabular-nums text-foreground">
              {formatINR(insights.cheapestInstantTotal)}
            </div>
            <div className="text-[10px] text-muted-foreground">{instantMeta.label}</div>
          </div>

          <ArrowRight className="size-4 text-muted-foreground shrink-0" />

          <div className="rounded-2xl border border-success/40 bg-success/15 px-3.5 py-2.5 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-success">
              <Calendar className="size-3" />
              DMart Value
            </div>
            <div className="mt-0.5 text-base font-extrabold tabular-nums text-success">
              {formatINR(insights.dmartTotal)}
            </div>
            <div className="text-[10px] text-muted-foreground">Scheduled</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendationCards({ report }: { report: ComparisonReport }) {
  const { bestSinglePlatform, splitCart, splitSavings } = report
  const splitWorth = splitSavings > 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Best single store */}
      <div
        className={cn(
          "relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-all",
          !splitWorth && bestSinglePlatform
            ? "border-success/50 bg-gradient-to-b from-success/15 to-card ring-1 ring-success/30 shadow-success/10"
            : "border-border/70 bg-card/85",
        )}
      >
        <div>
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Store className="size-4 text-primary" />
              Cheapest Single Store
            </span>
            {bestSinglePlatform && (
              <span className="flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                <Clock className="size-3 text-muted-foreground" />
                {PLATFORMS[bestSinglePlatform.platform].etaLabel}
              </span>
            )}
          </div>
          {bestSinglePlatform ? (
            <>
              <div className="mb-2 flex flex-wrap items-baseline gap-2.5">
                <span className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-4xl">
                  {formatINR(bestSinglePlatform.total)}
                </span>
                <PlatformBadge platform={bestSinglePlatform.platform} />
              </div>
              <p className="text-xs text-muted-foreground">
                All {bestSinglePlatform.totalItems} items in 1 delivery. Includes{" "}
                {bestSinglePlatform.deliveryFee === 0 ? "free delivery" : formatINR(bestSinglePlatform.deliveryFee) + " delivery"}{" "}
                + {formatINR(bestSinglePlatform.handlingFee)} handling fee.
              </p>

              {/* Direct links to products in this single store cart */}
              <div className="mt-4 border-t border-border/60 pt-3">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Items from {PLATFORMS[bestSinglePlatform.platform].label}:
                </div>
                <div className="flex flex-col gap-1.5">
                  {report.items.map((item) => {
                    const match = item.matches.find((m) => m.platform === bestSinglePlatform.platform)
                    if (!match?.product) return null
                    const url = getPlatformProductLink(bestSinglePlatform.platform, match.product.name)
                    return (
                      <a
                        key={item.query}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl bg-background/60 px-3 py-2 text-xs transition hover:bg-accent hover:text-foreground"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-foreground group-hover:text-primary">
                            {match.product.name}
                          </span>
                          <span className="text-muted-foreground">× {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                          <span className="font-bold text-foreground">{formatINR(match.lineTotal ?? 0)}</span>
                          <ExternalLink className="size-3 text-muted-foreground transition group-hover:text-primary" />
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No single store stocks every item in your basket. Use the smart split below.
            </p>
          )}
        </div>
      </div>

      {/* Smart split cart */}
      <div
        className={cn(
          "relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-all",
          splitWorth
            ? "border-success/50 bg-gradient-to-b from-success/15 to-card ring-1 ring-success/30 shadow-success/10"
            : "border-border/70 bg-card/85",
        )}
      >
        <div>
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Split className="size-4 text-emerald-500" />
              Smart Split Cart (Optimal Multi-Store)
            </span>
            {splitWorth && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-0.5 text-xs font-bold text-success-foreground shadow-xs">
                <TrendingDown className="size-3" />
                Save {formatINR(splitSavings)}
              </span>
            )}
          </div>
          <div className="mb-2 flex flex-wrap items-baseline gap-2.5">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {formatINR(splitCart.total)}
            </span>
            <span className="text-xs text-muted-foreground">
              Across {splitCart.platformsUsed.length} orders (all fees included)
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Takes advantage of lowest per-item sticker prices across stores while accounting for multi-store delivery charges.
          </p>

          {/* Grouped orders in split cart */}
          <div className="mt-4 border-t border-border/60 pt-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Split Breakdown & Direct Links:
            </div>
            <div className="flex flex-col gap-2">
              {splitCart.platformsUsed.map((p) => {
                const platformLines = splitCart.lines.filter((l) => l.platform === p)
                const meta = PLATFORMS[p]
                return (
                  <div key={p} className="rounded-2xl border border-border/80 bg-background/80 p-3 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PlatformDot platform={p} />
                        <span className="text-xs font-bold text-foreground">{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground">({meta.etaLabel})</span>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {platformLines.length} item{platformLines.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {platformLines.map((line) => {
                        const url = getPlatformProductLink(p, line.product.name)
                        return (
                          <a
                            key={line.query}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition hover:bg-accent"
                          >
                            <span className="truncate text-muted-foreground group-hover:text-foreground">
                              {line.product.name} × {line.quantity}
                            </span>
                            <span className="flex items-center gap-1 shrink-0 font-bold text-foreground">
                              {formatINR(line.lineTotal)}
                              <ExternalLink className="size-2.5 text-muted-foreground opacity-60 transition group-hover:opacity-100" />
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      {(!splitWorth && bestSinglePlatform) || splitWorth ? (
        <div className="md:col-span-2 -mt-1 flex items-center justify-center gap-2 rounded-2xl bg-card/90 border border-border/70 px-4 py-3 text-xs text-muted-foreground shadow-xs">
          <Trophy className="size-4 text-emerald-500 shrink-0" />
          <span className="text-center font-medium">
            {splitWorth
              ? `Smart split saves you ${formatINR(splitSavings)} net compared to ordering from any single store.`
              : `Buying everything from ${PLATFORMS[bestSinglePlatform!.platform].label} is your cheapest overall option.`}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function PlatformTotals({
  report,
  visiblePlatforms,
}: {
  report: ComparisonReport
  visiblePlatforms: Platform[]
}) {
  const visibleBaskets = report.baskets.filter((b) => visiblePlatforms.includes(b.platform))
  const cheapestTotal = Math.min(
    ...visibleBaskets.filter((b) => b.subtotal > 0).map((b) => b.total),
  )

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Delivered Cost by Store
        </h2>
        <span className="text-xs text-muted-foreground">Item Subtotal + Delivery + Handling</span>
      </div>

      <div
        className={cn(
          "grid gap-3.5",
          visibleBaskets.length === 1 && "grid-cols-1",
          visibleBaskets.length === 2 && "grid-cols-1 sm:grid-cols-2",
          visibleBaskets.length >= 3 && visibleBaskets.length <= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          visibleBaskets.length >= 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        )}
      >
        {visibleBaskets.map((b) => {
          const isCheapest = b.subtotal > 0 && b.total === cheapestTotal
          const meta = PLATFORMS[b.platform]
          const storeUrl = getPlatformProductLink(b.platform, report.items[0]?.query ?? "groceries")

          return (
            <div
              key={b.platform}
              className={cn(
                "flex flex-col justify-between rounded-3xl border p-4 shadow-md backdrop-blur-xl transition-all",
                isCheapest
                  ? "border-success/60 bg-gradient-to-b from-success/15 to-card ring-1 ring-success/30 shadow-success/10"
                  : "border-border/70 bg-card/85 hover:border-border",
              )}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <PlatformBadge platform={b.platform} />
                  {isCheapest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
                      <Check className="size-3" /> Best
                    </span>
                  )}
                </div>

                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{meta.etaLabel}</span>
                </div>

                <div className="my-2.5 text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                  {b.subtotal > 0 ? formatINR(b.total) : "—"}
                </div>

                <dl className="flex flex-col gap-1.5 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                  <Row label="Items subtotal" value={formatINR(b.subtotal)} />
                  <Row
                    label="Delivery fee"
                    value={
                      b.deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                      ) : (
                        formatINR(b.deliveryFee)
                      )
                    }
                  />
                  <Row label="Handling fee" value={formatINR(b.handlingFee)} />
                </dl>

                {b.deliveryFee > 0 && b.subtotal < meta.freeDeliveryAbove && (
                  <p className="mt-2 text-[11px] text-muted-foreground/90">
                    Add {formatINR(meta.freeDeliveryAbove - b.subtotal)} for free delivery
                  </p>
                )}

                {!b.hasAllItems && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <Ban className="size-3.5" />
                    {b.availableCount}/{b.totalItems} items available
                  </p>
                )}
              </div>

              <div className="mt-4 border-t border-border/50 pt-3">
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-secondary/80 py-2 text-xs font-bold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground shadow-xs"
                >
                  Visit {meta.label}
                  <ExternalLink className="size-3 opacity-70" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className="tabular-nums font-semibold text-foreground">{value}</dd>
    </div>
  )
}

function ItemBreakdown({
  items,
  visiblePlatforms,
}: {
  items: ItemComparison[]
  visiblePlatforms: Platform[]
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-lg backdrop-blur-xl">
      <div className="border-b border-border/70 px-5 py-4">
        <h2 className="text-base font-extrabold text-foreground sm:text-lg">
          Item-by-Item Price Comparison
        </h2>
        <p className="text-xs text-muted-foreground">
          Click any product to open the exact product page with matching price. Green highlight indicates lowest price.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {items.map((item) => (
          <div key={item.query} className="px-4 py-4 sm:px-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{item.query}</span>
                {item.brand && item.brand !== "Any" && (
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {item.brand}
                  </span>
                )}
                {item.packSize && (
                  <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {item.packSize}
                  </span>
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-3",
                visiblePlatforms.length === 1 && "grid-cols-1",
                visiblePlatforms.length === 2 && "grid-cols-1 sm:grid-cols-2",
                visiblePlatforms.length >= 3 && visiblePlatforms.length <= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                visiblePlatforms.length >= 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
              )}
            >
              {visiblePlatforms.map((platform) => {
                const m = item.matches.find((x) => x.platform === platform)
                const cheapest = m?.isCheapest
                const unavailable = !m?.product || m.lineTotal == null
                const meta = PLATFORMS[platform]
                const directUrl = m?.product
                  ? getPlatformProductLink(platform, m.product.name)
                  : getPlatformProductLink(platform, item.query)

                return (
                  <div
                    key={platform}
                    className={cn(
                      "flex flex-col justify-between rounded-2xl border p-3.5 shadow-sm transition-all",
                      cheapest
                        ? "border-success/60 bg-gradient-to-b from-success/15 to-background ring-1 ring-success/25"
                        : "border-border/70 bg-background/70 hover:border-border",
                      unavailable && "opacity-50",
                    )}
                  >
                    <div>
                      {/* Platform header */}
                      <div className="mb-2 flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <PlatformDot platform={platform} />
                          {meta.label}
                        </span>
                        {cheapest && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success">
                            <Check className="size-3" /> Lowest
                          </span>
                        )}
                      </div>

                      {unavailable ? (
                        <div className="my-5 text-center">
                          <p className="text-xs font-medium text-muted-foreground">Not currently stocked</p>
                        </div>
                      ) : (
                        <>
                          {/* Exact Product Name Link */}
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group mb-2.5 block text-xs font-bold leading-snug text-foreground transition hover:text-primary"
                            title={`Open exact product on ${meta.label}`}
                          >
                            <span className="line-clamp-2 underline-offset-2 group-hover:underline">
                              {m.product!.name}
                            </span>
                          </a>

                          {/* Price Display */}
                          <div className="mb-1 flex items-baseline justify-between gap-2">
                            <div>
                              <span className="text-xl font-extrabold tabular-nums tracking-tight text-foreground">
                                {formatINR(m.lineTotal!)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="ml-1 text-[11px] text-muted-foreground">
                                  ({formatINR(m.product!.price)} ea)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              {formatINR(m.product!.pricePerBaseUnit)}/{m.product!.baseUnit}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{formatUnit(m.product!.quantity, m.product!.unit)}</span>
                            {m.product!.mrp > m.product!.price && (
                              <span className="line-through opacity-70">
                                MRP {formatINR(m.product!.mrp * item.quantity)}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!unavailable && (
                      <div className="mt-3 pt-2.5 border-t border-border/50">
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-xs",
                            cheapest
                              ? "bg-success text-success-foreground hover:bg-success/90"
                              : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
                          )}
                        >
                          Buy on {meta.label}
                          <ExternalLink className="size-3 opacity-70" />
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
