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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatCompactLocation,
  formatDaybookDate,
  formatQuantity,
} from "@/features/daybook/utils/format"

import type { LocationAnalyticsQuantityTab } from "../types"
import type { FilteredChamberOrder } from "../utils/filter-chamber-orders"
import { getBagQuantity } from "../utils/get-location-quantity"

type ChamberOrdersTableProps = {
  orders: FilteredChamberOrder[]
  tab: LocationAnalyticsQuantityTab
  floorLabel: string
}

export function ChamberOrdersTable({
  orders,
  tab,
  floorLabel,
}: ChamberOrdersTableProps) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">
          Gate passes on floor
        </CardTitle>
        <CardDescription>
          {floorLabel ? `Showing passes on ${floorLabel}` : "Select a floor"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gate passes on this floor.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="sticky left-0 z-10 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                    GP #
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Farmer
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Variety
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Size / location
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Bags
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map(({ order, bagSizes, totalBags }) => (
                  <TableRow key={order._id}>
                    <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 font-mono tabular-nums text-foreground">
                      {order.gatePassNo}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 tabular-nums text-foreground">
                      {formatDaybookDate(order.date)}
                    </TableCell>
                    <TableCell
                      className="max-w-[160px] px-3 py-2.5 font-medium text-foreground"
                      title={order.farmerName}
                    >
                      <span className="block truncate">{order.farmerName}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-foreground">
                      {order.variety}
                    </TableCell>
                    <TableCell className="min-w-[200px] px-3 py-2.5">
                      <ul className="space-y-1">
                        {bagSizes.map((bag) => (
                          <li
                            key={`${bag.name}-${formatCompactLocation(bag.location)}`}
                            className="text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {bag.name}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              · {formatCompactLocation(bag.location)} ·{" "}
                            </span>
                            <span className="tabular-nums text-foreground">
                              {formatQuantity(getBagQuantity(bag, tab))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                      {formatQuantity(totalBags)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
