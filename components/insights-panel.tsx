import { PiggyBank, Timer, Percent, PackageCheck, TrendingDown, TrendingUp } from "lucide-react"
import type { Insights } from "@/lib/aggregate"
import { PLATFORMS } from "@/lib/scrapers/platforms"
import { formatINR } from "@/lib/format"
import { PlatformDot } from "@/components/platform-badge"

export function InsightsPanel({ insights }: { insights: Insights }) {
  const {
    savingsVsMostExpensive,
    savingsPct,
    mrpSavings,
    fastestPlatform,
    fastestEta,
    inStockRate,
    cheapestTrendPct,
  } = insights

  const trendDown = cheapestTrendPct <= 0
  const trendPctAbs = Math.abs(cheapestTrendPct)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<PiggyBank className="size-4" />}
        label="You save"
        value={formatINR(savingsVsMostExpensive)}
        sub={`${savingsPct.toFixed(0)}% vs priciest basket`}
        accent
      />
      <StatCard
        icon={<Percent className="size-4" />}
        label="Off MRP"
        value={formatINR(mrpSavings)}
        sub="on the recommended cart"
      />
      <StatCard
        icon={<Timer className="size-4" />}
        label="Fastest delivery"
        value={fastestEta != null ? `${fastestEta} min` : "—"}
        sub={
          fastestPlatform ? (
            <span className="inline-flex items-center gap-1">
              <PlatformDot platform={fastestPlatform} />
              {PLATFORMS[fastestPlatform].label}
            </span>
          ) : (
            "—"
          )
        }
      />
      <StatCard
        icon={
          trendDown ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />
        }
        label="Cheapest 2-wk trend"
        value={`${trendDown ? "−" : "+"}${trendPctAbs.toFixed(1)}%`}
        sub={
          <span className="inline-flex items-center gap-1">
            <PackageCheck className="size-3" />
            {(inStockRate * 100).toFixed(0)}% in stock
          </span>
        }
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (accent ? "border-success/40 bg-success/10" : "border-border bg-card")
      }
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={accent ? "text-success" : "text-muted-foreground"}>{icon}</span>
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums leading-none text-foreground">{value}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}
