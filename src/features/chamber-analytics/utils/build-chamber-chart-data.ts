import type { ChartConfig } from "@/components/ui/chart"

import type {
  LocationAnalyticsChamber,
  LocationAnalyticsQuantityTab,
} from "../types"
import { getChamberQuantity } from "./get-location-quantity"

export type ChamberBarItem = {
  key: string
  label: string
  bags: number
  fill: string
  isSentinel: boolean
}

export type ChamberBarChart = {
  items: ChamberBarItem[]
  chartConfig: ChartConfig
}

const PRIMARY_BAR_FILL = "var(--primary)"
const MUTED_BAR_FILL = "var(--muted-foreground)"

function toChartKey(label: string, index: number): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "chamber"

  return `${base}-${index}`
}

export function buildChamberChartData(
  chambers: LocationAnalyticsChamber[],
  tab: LocationAnalyticsQuantityTab,
): ChamberBarChart {
  const chartConfig: ChartConfig = {
    bags: {
      label: "Bags",
      color: PRIMARY_BAR_FILL,
    },
    label: {
      color: "var(--primary-foreground)",
    },
  }

  const sorted = [...chambers]
    .filter((chamber) => getChamberQuantity(chamber, tab) > 0)
    .sort((a, b) => {
      const diff = getChamberQuantity(b, tab) - getChamberQuantity(a, tab)
      if (diff !== 0) return diff
      return a.chamber.localeCompare(b.chamber)
    })

  if (sorted.length === 0) {
    return { items: [], chartConfig }
  }

  const items: ChamberBarItem[] = sorted.map((chamber, index) => {
    const key = toChartKey(chamber.chamber, index)
    const isSentinel = chamber.chamber.startsWith("(")

    chartConfig[key] = {
      label: chamber.chamber,
    }

    return {
      key,
      label: chamber.chamber,
      bags: getChamberQuantity(chamber, tab),
      fill: isSentinel ? MUTED_BAR_FILL : PRIMARY_BAR_FILL,
      isSentinel,
    }
  })

  return { items, chartConfig }
}
