import { Trophy, Split, Check, Ban, Store, TrendingDown } from "lucide-react"
import type { ComparisonReport, ItemComparison } from "@/lib/aggregate"
import { PLATFORMS } from "@/lib/scrapers/platforms"
import type { Platform } from "@/lib/scrapers/types"
import { formatINR, formatUnit } from "@/lib/format"
import { PlatformBadge, PlatformDot } from "@/components/platform-badge"
import { InsightsPanel } from "@/components/insights-panel"
import { PriceTrendChart } from "@/components/price-trend-chart"
import { cn } from "@/lib/utils"

export function ResultsView({ report }: { report: ComparisonReport }) {
  return (
    <div className="flex flex-col gap-6">
      <RecommendationCards report={report} />
      <InsightsPanel insights={report.insights} />
      <PriceTrendChart trend={report.trend} />
      <PlatformTotals report={report} />
      <ItemBreakdown items={report.items} />
      <p className="text-pretty text-center text-xs text-muted-foreground">
        Prices are illustrative sample data for pincode {report.pincode}. Delivery and handling fees are
        included in every total.
      </p>
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
          "relative overflow-hidden rounded-2xl border p-5",
          !splitWorth && bestSinglePlatform
            ? "border-success/40 bg-success/10"
            : "border-border bg-card",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Store className="size-4" />
          Cheapest single store
        </div>
        {bestSinglePlatform ? (
          <>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {formatINR(bestSinglePlatform.total)}
              </span>
              <PlatformBadge platform={bestSinglePlatform.platform} />
            </div>
            <p className="text-sm text-muted-foreground">
              All {bestSinglePlatform.totalItems} items in one order
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No single store stocks every item. Use the smart split instead.
          </p>
        )}
      </div>

      {/* Smart split */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5",
          splitWorth ? "border-success/40 bg-success/10" : "border-border bg-card",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Split className="size-4" />
          Smart split (cheapest per item)
        </div>
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {formatINR(splitCart.total)}
          </span>
          {splitWorth && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">
              <TrendingDown className="size-3" />
              Save {formatINR(splitSavings)}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Split across</span>
          {splitCart.platformsUsed.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
              <PlatformDot platform={p} />
              {PLATFORMS[p].label}
            </span>
          ))}
        </div>
      </div>

      {(!splitWorth && bestSinglePlatform) || splitWorth ? (
        <div className="md:col-span-2 -mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Trophy className="size-4 text-success" />
          <span className="text-pretty text-center">
            {splitWorth
              ? `Splitting your basket saves ${formatINR(splitSavings)} versus the cheapest single store.`
              : "Buying everything from one store is your best deal here."}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function PlatformTotals({ report }: { report: ComparisonReport }) {
  const cheapestTotal = Math.min(
    ...report.baskets.filter((b) => b.subtotal > 0).map((b) => b.total),
  )
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {report.baskets.map((b) => {
        const isCheapest = b.subtotal > 0 && b.total === cheapestTotal
        return (
          <div
            key={b.platform}
            className={cn(
              "rounded-2xl border bg-card p-4",
              isCheapest ? "border-success/50 ring-1 ring-success/30" : "border-border",
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <PlatformBadge platform={b.platform} />
              {isCheapest && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <Check className="size-3.5" /> Best
                </span>
              )}
            </div>
            <div className="mb-2 text-2xl font-bold tabular-nums text-foreground">
              {formatINR(b.total)}
            </div>
            <dl className="flex flex-col gap-1 text-xs text-muted-foreground">
              <Row label="Items subtotal" value={formatINR(b.subtotal)} />
              <Row label="Delivery fee" value={b.deliveryFee === 0 ? "Free" : formatINR(b.deliveryFee)} />
              <Row label="Handling fee" value={formatINR(b.handlingFee)} />
            </dl>
            {!b.hasAllItems && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <Ban className="size-3.5" />
                {b.availableCount}/{b.totalItems} items available
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

function ItemBreakdown({ items }: { items: ItemComparison[] }) {
  const platforms = Object.keys(PLATFORMS) as Platform[]
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Item-by-item comparison</h2>
        <p className="text-sm text-muted-foreground">Green = cheapest option for that item</p>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <div key={item.query} className="px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{item.query}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                x{item.quantity}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {platforms.map((platform) => {
                const m = item.matches.find((x) => x.platform === platform)!
                const cheapest = m.isCheapest
                const unavailable = !m.product || m.lineTotal == null
                return (
                  <div
                    key={platform}
                    className={cn(
                      "rounded-xl border p-3",
                      cheapest
                        ? "border-success/50 bg-success/10 ring-1 ring-success/20"
                        : "border-border bg-background",
                      unavailable && "opacity-60",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <PlatformDot platform={platform} />
                        {PLATFORMS[platform].label}
                      </span>
                      {cheapest && (
                        <Check className="size-4 text-success" aria-label="Cheapest for this item" />
                      )}
                    </div>
                    {unavailable ? (
                      <p className="text-sm text-muted-foreground">Not available</p>
                    ) : (
                      <>
                        <p className="mb-0.5 truncate text-xs text-muted-foreground" title={m.product!.name}>
                          {m.product!.name}
                        </p>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-lg font-bold tabular-nums text-foreground">
                            {formatINR(m.lineTotal!)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatINR(m.product!.pricePerBaseUnit)}/{m.product!.baseUnit}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatUnit(m.product!.quantity, m.product!.unit)} · {formatINR(m.product!.price)} each
                        </p>
                      </>
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
