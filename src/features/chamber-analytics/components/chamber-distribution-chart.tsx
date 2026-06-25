"use client"

import { useMemo } from "react"
import { Warehouse } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatQuantity } from "@/features/daybook/utils/format"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import type { LocationAnalyticsQuantityTab } from "../types"
import {
  buildChamberChartData,
  type ChamberBarItem,
} from "../utils/build-chamber-chart-data"
import type { LocationAnalyticsChamber } from "../types"

const QUANTITY_MODE_SUBTITLES: Record<LocationAnalyticsQuantityTab, string> = {
  current: "Stock by chamber (current quantity)",
  initial: "Stock by chamber (initial quantity)",
}

const DESKTOP_BAR_LAYOUT = {
  barSize: 42,
  rowHeight: 68,
  categoryGap: 22,
  minHeight: 260,
} as const

const MOBILE_BAR_LAYOUT = {
  barSize: 32,
  rowHeight: 58,
  categoryGap: 22,
  minHeight: 220,
} as const

function truncateLabel(label: string, maxLength = 28): string {
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength - 1).trim()}…`
}

type ChamberDistributionChartProps = {
  chambers: LocationAnalyticsChamber[]
  tab: LocationAnalyticsQuantityTab
}

export function ChamberDistributionChart({
  chambers,
  tab,
}: ChamberDistributionChartProps) {
  const isMobile = useIsMobile()
  const barLayout = isMobile ? MOBILE_BAR_LAYOUT : DESKTOP_BAR_LAYOUT

  const { items, chartConfig } = useMemo(
    () => buildChamberChartData(chambers, tab),
    [chambers, tab],
  )

  const chartHeight = Math.max(
    items.length * barLayout.rowHeight,
    barLayout.minHeight,
  )

  const maxValueLabelWidth = useMemo(() => {
    const widest = items.reduce(
      (max, item) => Math.max(max, formatQuantity(item.bags).length),
      0,
    )
    return Math.max(widest * 8 + 16, 48)
  }, [items])

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <Warehouse className="size-5 text-primary" aria-hidden />
          Chamber distribution
        </CardTitle>
        <CardDescription>{QUANTITY_MODE_SUBTITLES[tab]}</CardDescription>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No chamber data for this view.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-xs [&_.recharts-cartesian-axis-tick_text]:tabular-nums"
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={items}
              layout="vertical"
              barCategoryGap={barLayout.categoryGap}
              margin={{
                top: 8,
                right: maxValueLabelWidth,
                bottom: 8,
                left: 8,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="key"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                hide
              />
              <XAxis
                dataKey="bags"
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => formatQuantity(Number(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="key"
                    formatter={(value, _name, item) => {
                      const chamber = item.payload as ChamberBarItem

                      return (
                        <div className="flex w-full flex-col gap-0.5 text-xs">
                          <span
                            className={cn(
                              "font-medium",
                              chamber.isSentinel
                                ? "text-muted-foreground italic"
                                : "text-foreground",
                            )}
                          >
                            {chamber.label}
                          </span>
                          <span className="tabular-nums text-foreground">
                            {formatQuantity(Number(value))} bags
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar
                dataKey="bags"
                fill="var(--primary)"
                radius={4}
                barSize={barLayout.barSize}
              >
                <LabelList
                  dataKey="label"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)"
                  fontSize={12}
                  formatter={(value) => truncateLabel(String(value ?? ""))}
                />
                <LabelList
                  dataKey="bags"
                  position="right"
                  offset={8}
                  className="fill-foreground tabular-nums"
                  fontSize={12}
                  formatter={(value) => formatQuantity(Number(value ?? 0))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
