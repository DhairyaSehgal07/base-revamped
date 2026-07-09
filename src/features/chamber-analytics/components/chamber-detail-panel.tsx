import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { useColdStorageStore } from "@/features/auth/store/use-cold-storage-store"
import {
  formatUtilizationPercent,
  getStorageLayoutChamberCapacity,
  getStorageLayoutFloorCapacity,
} from "@/features/auth/utils/storage-layout"
import { formatQuantity } from "@/features/daybook/utils/format"
import {
  QuantityModeTabLabel,
  StockSummaryTabBar,
} from "@/features/people/components/farmer-stock-summary-tabs"
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"

import type {
  LocationAnalyticsChamber,
  LocationAnalyticsQuantityTab,
} from "../types"
import { filterChamberOrders } from "../utils/filter-chamber-orders"
import { resolveFloorTabs } from "../utils/resolve-floor-tabs"
import { isSentinelLabel } from "./chamber-analytics-summary-cards"
import { ChamberFloorTable } from "./chamber-floor-table"
import { ChamberOrdersTable } from "./chamber-orders-table"

function formatPercent(value: number): string {
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

type ChamberDetailPanelProps = {
  chamber: LocationAnalyticsChamber
  tab: LocationAnalyticsQuantityTab
  floor: string
  onFloorChange: (floor: string) => void
}

export function ChamberDetailPanel({
  chamber,
  tab,
  floor,
  onFloorChange,
}: ChamberDetailPanelProps) {
  const storageLayout = useColdStorageStore(
    (state) => state.coldStorage?.storageLayout,
  )
  const layoutChamberCapacity = getStorageLayoutChamberCapacity(
    storageLayout,
    chamber.chamber,
  )
  const utilizationCapacity =
    layoutChamberCapacity != null && layoutChamberCapacity > 0
      ? layoutChamberCapacity
      : chamber.initialTotal

  const { tabs: floorTabs, activeFloor } = resolveFloorTabs(chamber, floor)
  const filteredOrders = activeFloor
    ? filterChamberOrders(chamber.orders, activeFloor, tab)
    : []

  const utilizationPercent = formatUtilizationPercent(
    chamber.currentTotal,
    utilizationCapacity,
  )
  const displayUtilization = Math.min(utilizationPercent, 100)
  const usesLayoutCapacity =
    layoutChamberCapacity != null && layoutChamberCapacity > 0

  const quantityTotal =
    tab === "current" ? chamber.currentTotal : chamber.initialTotal

  const floorLabel =
    activeFloor ??
    floorTabs.find((item) => item.value === activeFloor)?.label ??
    ""

  const floorCapacities = Object.fromEntries(
    chamber.floors.map((item) => [
      item.floor,
      getStorageLayoutFloorCapacity(
        storageLayout,
        chamber.chamber,
        item.floor,
      ) ?? undefined,
    ]),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h2
                className={cn(
                  "font-heading text-base font-semibold",
                  isSentinelLabel(chamber.chamber)
                    ? "text-muted-foreground italic"
                    : "text-foreground",
                )}
              >
                {chamber.chamber}
              </h2>
              <p className="text-sm text-muted-foreground">
                {chamber.orderCount}{" "}
                {chamber.orderCount === 1 ? "pass" : "passes"} ·{" "}
                {formatQuantity(quantityTotal)} bags (
                {tab === "current" ? "current" : "initial"})
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium tabular-nums text-foreground">
              {formatQuantity(chamber.currentTotal)} /{" "}
              {formatQuantity(utilizationCapacity)} bags
              <span className="text-muted-foreground">
                {" "}
                (
                {formatPercent(utilizationPercent)}{" "}
                {usesLayoutCapacity ? "utilized" : "retained"})
              </span>
            </p>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${displayUtilization}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ChamberFloorTable
        floors={chamber.floors}
        tab={tab}
        chamberInitialTotal={chamber.initialTotal}
        chamberCurrentTotal={chamber.currentTotal}
        floorCapacities={floorCapacities}
        selectedFloor={activeFloor}
        onFloorSelect={onFloorChange}
      />

      {activeFloor ? (
        <ChamberOrdersTable
          orders={filteredOrders}
          tab={tab}
          floorLabel={floorLabel}
        />
      ) : (
        <Empty className="rounded-xl border border-dashed border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>Select a floor</EmptyTitle>
            <EmptyDescription>
              Click a floor row in the table above to view gate passes stored in
              this chamber.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

export type ChamberSelectorProps = {
  chambers: LocationAnalyticsChamber[]
  activeChamber: string
  onChamberChange: (chamber: string) => void
}

export function ChamberSelector({
  chambers,
  activeChamber,
  onChamberChange,
}: ChamberSelectorProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="space-y-0 bg-muted/20">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <StockSummaryTabBar
            value={activeChamber}
            onValueChange={onChamberChange}
            items={chambers.map((chamber) => ({
              value: chamber.chamber,
              label: (
                <QuantityModeTabLabel
                  label={chamber.chamber}
                  count={chamber.orderCount}
                />
              ),
            }))}
            ariaLabel="Chamber selector"
          />
        </div>
        <Separator />
      </div>
    </div>
  )
}
