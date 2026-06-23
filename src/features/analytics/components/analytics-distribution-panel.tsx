import { Cell, Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AnalyticsDistributionTable } from "@/features/analytics/components/analytics-distribution-table"
import type { AnalyticsDistribution } from "@/features/analytics/utils/build-analytics-distribution"
import type { StockQuantityMode } from "@/features/people/utils/build-farmer-stock-summary"

const QUANTITY_MODE_SUBTITLES: Record<StockQuantityMode, string> = {
  current: "By current inventory",
  initial: "By initial quantities",
  outgoing: "By outgoing quantities",
}

type AnalyticsDistributionPanelProps = {
  title: string
  labelColumn: string
  distribution: AnalyticsDistribution
  quantityMode: StockQuantityMode
}

export function AnalyticsDistributionPanel({
  title,
  labelColumn,
  distribution,
  quantityMode,
}: AnalyticsDistributionPanelProps) {
  const hasData = distribution.total > 0 && distribution.items.length > 0
  const topItem = distribution.items[0] ?? null

  const chartData = distribution.items.map((item) => ({
    ...item,
    name: item.key,
    shareLabel: `${item.share.toLocaleString("en-IN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          {title}
        </CardTitle>
        <CardDescription>
          {QUANTITY_MODE_SUBTITLES[quantityMode]}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {hasData ? (
          <ChartContainer
            config={distribution.chartConfig}
            className="mx-auto aspect-square max-h-[320px] w-full max-w-[360px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as
                        | { label?: string; share?: number }
                        | undefined
                      if (!item?.label) return null

                      return (
                        <div className="flex items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {typeof item.share === "number" ? (
                            <span className="tabular-nums text-muted-foreground">
                              {item.share.toLocaleString("en-IN", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })}
                              %
                            </span>
                          ) : null}
                        </div>
                      )
                    }}
                    formatter={(value) => [
                      <span className="tabular-nums">
                        {typeof value === "number"
                          ? value.toLocaleString("en-IN")
                          : value}{" "}
                        bags
                      </span>,
                      "",
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="bags"
                nameKey="name"
                innerRadius="58%"
                outerRadius="88%"
                strokeWidth={4}
                stroke="hsl(var(--background))"
                paddingAngle={2}
                labelLine={false}
                label={({ cx, cy, midAngle, outerRadius, payload }) => {
                  if (
                    !payload ||
                    payload.share < 6 ||
                    midAngle === undefined ||
                    cx === undefined ||
                    cy === undefined
                  ) {
                    return null
                  }

                  const radius = Number(outerRadius) + 18
                  const x = Number(cx) + radius * Math.cos((-midAngle * Math.PI) / 180)
                  const y = Number(cy) + radius * Math.sin((-midAngle * Math.PI) / 180)

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="currentColor"
                      textAnchor={x > Number(cx) ? "start" : "end"}
                      dominantBaseline="central"
                      className="fill-foreground text-[11px] font-medium"
                    >
                      {payload.shortLabel} {payload.shareLabel}
                    </text>
                  )
                }}
              >
                <Label
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      !topItem ||
                      !("cx" in viewBox) ||
                      !("cy" in viewBox) ||
                      viewBox.cx === undefined ||
                      viewBox.cy === undefined
                    ) {
                      return null
                    }

                    const { cx, cy } = viewBox

                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          y={cy - 10}
                          className="fill-muted-foreground text-[11px]"
                        >
                          Top share
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 12}
                          className="fill-foreground text-sm font-semibold"
                        >
                          {topItem.share.toLocaleString("en-IN", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                          %
                        </tspan>
                      </text>
                    )
                  }}
                />
                {chartData.map((item) => (
                  <Cell key={item.key} fill={item.fill} />
                ))}
              </Pie>
              <ChartLegend
                verticalAlign="bottom"
                content={
                  <ChartLegendContent
                    nameKey="name"
                    className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4"
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
            No chart data for this view.
          </div>
        )}

        <AnalyticsDistributionTable
          distribution={distribution}
          labelColumn={labelColumn}
        />
      </CardContent>
    </Card>
  )
}
