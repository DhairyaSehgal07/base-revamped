import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatQuantity } from "@/features/daybook/utils/format"
import { cn } from "@/lib/utils"

import type { LocationAnalyticsFloor, LocationAnalyticsQuantityTab } from "../types"
import { getFloorQuantity } from "../utils/get-location-quantity"
import { isSentinelLabel } from "./chamber-analytics-summary-cards"

function formatShare(value: number): string {
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

function formatUtilization(current: number, initial: number): number {
  if (initial <= 0) return 0
  return Math.min((current / initial) * 100, 100)
}

type ChamberFloorTableProps = {
  floors: LocationAnalyticsFloor[]
  tab: LocationAnalyticsQuantityTab
  chamberInitialTotal: number
  chamberCurrentTotal: number
  selectedFloor: string | null
  onFloorSelect: (floor: string) => void
}

export function ChamberFloorTable({
  floors,
  tab,
  chamberInitialTotal,
  chamberCurrentTotal,
  selectedFloor,
  onFloorSelect,
}: ChamberFloorTableProps) {
  const chamberTotal =
    tab === "current" ? chamberCurrentTotal : chamberInitialTotal

  const rows = [...floors]
    .map((floor) => ({
      floor,
      quantity: getFloorQuantity(floor, tab),
      utilization: formatUtilization(floor.currentTotal, floor.initialTotal),
    }))
    .filter((row) => row.quantity > 0)
    .sort((a, b) => {
      const aSentinel = isSentinelLabel(a.floor.floor)
      const bSentinel = isSentinelLabel(b.floor.floor)
      if (aSentinel !== bSentinel) return aSentinel ? 1 : -1

      return a.floor.floor.localeCompare(b.floor.floor, "en-IN", {
        numeric: true,
      })
    })

  const tableTotal = rows.reduce((sum, row) => sum + row.quantity, 0)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">
          Floor breakdown
        </CardTitle>
        <CardDescription>
          {tab === "current" ? "Current quantity" : "Initial quantity"} by
          floor · click a row to view gate passes
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No floor data for this chamber.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Floor
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Bags
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Share
                  </TableHead>
                  <TableHead className="h-10 min-w-[140px] px-3 font-medium text-muted-foreground">
                    Utilization
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  const share =
                    chamberTotal > 0 ? (row.quantity / chamberTotal) * 100 : 0
                  const isSelected = row.floor.floor === selectedFloor

                  return (
                    <TableRow
                      key={row.floor.floor}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/5 hover:bg-primary/10",
                      )}
                      onClick={() => onFloorSelect(row.floor.floor)}
                    >
                      <TableCell
                        className={cn(
                          "px-3 py-2.5 font-medium",
                          isSelected
                            ? "text-primary"
                            : isSentinelLabel(row.floor.floor)
                              ? "text-muted-foreground italic"
                              : "text-foreground",
                        )}
                        title={row.floor.floor}
                      >
                        <span className="block truncate">{row.floor.floor}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {formatQuantity(row.quantity)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-2.5 text-right font-medium tabular-nums",
                          isSelected ? "bg-primary/5 text-primary" : "text-primary",
                        )}
                      >
                        {formatShare(share)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-[width] duration-300"
                              style={{ width: `${row.utilization}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {formatShare(row.utilization)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>

              <TableFooter className="bg-muted/30">
                <TableRow>
                  <TableCell className="px-3 py-2.5 font-semibold text-foreground">
                    Total
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {formatQuantity(tableTotal)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-primary">
                    {chamberTotal > 0 ? formatShare(100) : "—"}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
