"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { LineChartIcon } from "lucide-react"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { TrendPoint } from "@/lib/aggregate"

const chartConfig = {
  blinkit: { label: "Blinkit", color: "var(--blinkit)" },
  zepto: { label: "Zepto", color: "var(--zepto)" },
  instamart: { label: "Instamart", color: "var(--instamart)" },
  flipkart: { label: "Flipkart Minutes", color: "var(--flipkart)" },
  dmart: { label: "DMart Ready", color: "var(--dmart)" },
} satisfies ChartConfig

export function PriceTrendChart({ trend }: { trend: TrendPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <LineChartIcon className="size-4 text-primary" />
          Basket price trend
        </h2>
        <p className="text-sm text-muted-foreground">
          What this exact basket would have cost on each platform over the last 14 days
        </p>
      </div>
      <div className="px-2 py-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart data={trend} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(v: string) => v.replace(/ /, "\u00A0")}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <ChartTooltip
              content={<ChartTooltipContent labelKey="label" indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="blinkit"
              type="monotone"
              stroke="var(--color-blinkit)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="zepto"
              type="monotone"
              stroke="var(--color-zepto)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="instamart"
              type="monotone"
              stroke="var(--color-instamart)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="flipkart"
              type="monotone"
              stroke="var(--color-flipkart)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="dmart"
              type="monotone"
              stroke="var(--color-dmart)"
              strokeWidth={2.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  )
}
