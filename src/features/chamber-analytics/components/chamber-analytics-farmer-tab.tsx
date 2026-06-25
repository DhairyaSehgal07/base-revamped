import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatCompactLocation,
  formatDaybookDate,
  formatQuantity,
} from "@/features/daybook/utils/format"
import { cn } from "@/lib/utils"
import { RefreshCw, User } from "lucide-react"

import { useLocationAnalytics } from "../api/use-location-analytics"
import type { LocationAnalyticsFarmer, LocationAnalyticsQuantityTab } from "../types"
import {
  buildFarmerRows,
  findFarmerById,
} from "../utils/build-farmer-rows"
import { getBagQuantity, sumBagQuantitiesForTab } from "../utils/get-location-quantity"

function formatShare(value: number): string {
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

type ChamberAnalyticsFarmerTabProps = {
  tab: LocationAnalyticsQuantityTab
  enabled: boolean
}

function FarmerTabSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  )
}

function FarmerOrderDetail({
  farmer,
  tab,
}: {
  farmer: LocationAnalyticsFarmer
  tab: LocationAnalyticsQuantityTab
}) {
  const orders = [...farmer.orders].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    return b.gatePassNo - a.gatePassNo
  })

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">
          {farmer.farmerName}
        </CardTitle>
        <CardDescription>
          Account #{farmer.accountNumber} · {farmer.orderCount}{" "}
          {farmer.orderCount === 1 ? "pass" : "passes"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gate passes for this farmer.
          </p>
        ) : (
          orders.map((order) => {
            const orderTotal = sumBagQuantitiesForTab(order.bagSizes, tab)

            if (orderTotal <= 0) return null

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="border-b border-border/60 bg-muted/20 px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                      GP #{order.gatePassNo}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatDaybookDate(order.date)}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {order.variety}
                    </span>
                    <span className="ml-auto text-sm font-medium tabular-nums text-primary">
                      {formatQuantity(orderTotal)} bags
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                          Size
                        </TableHead>
                        <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                          Bags
                        </TableHead>
                        <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                          Location
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.bagSizes.map((bag) => {
                        const qty = getBagQuantity(bag, tab)
                        if (qty <= 0) return null

                        return (
                          <TableRow
                            key={`${bag.name}-${formatCompactLocation(bag.location)}`}
                          >
                            <TableCell className="px-3 py-2.5 font-medium text-foreground">
                              {bag.name}
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                              {formatQuantity(qty)}
                            </TableCell>
                            <TableCell className="px-3 py-2.5 font-mono text-sm text-muted-foreground">
                              {formatCompactLocation(bag.location)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

export function ChamberAnalyticsFarmerTab({
  tab,
  enabled,
}: ChamberAnalyticsFarmerTabProps) {
  const analytics = useLocationAnalytics({ enabled })
  const farmers = analytics.response?.data?.byFarmer ?? []

  const rows = useMemo(
    () => buildFarmerRows(farmers, tab),
    [farmers, tab],
  )

  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null)

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedFarmerId(null)
      return
    }

    if (
      !selectedFarmerId ||
      !rows.some((row) => row.farmerId === selectedFarmerId)
    ) {
      setSelectedFarmerId(rows[0]?.farmerId ?? null)
    }
  }, [rows, selectedFarmerId])

  const selectedFarmer = findFarmerById(farmers, selectedFarmerId)
  const tableTotal = rows.reduce((sum, row) => sum + row.totalBags, 0)

  if (analytics.isLoading) {
    return <FarmerTabSkeleton />
  }

  if (analytics.isError) {
    return (
      <Empty className="rounded-xl border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load farmer analytics</EmptyTitle>
          <EmptyDescription>
            {analytics.error instanceof Error
              ? analytics.error.message
              : "Something went wrong while fetching farmer data."}
          </EmptyDescription>
        </EmptyHeader>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void analytics.refetch()}
        >
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
      </Empty>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty className="rounded-xl border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <User />
          </EmptyMedia>
          <EmptyTitle>No farmer data</EmptyTitle>
          <EmptyDescription>
            There are no gate passes with stock to show by farmer.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold">
            Farmer summary
          </CardTitle>
          <CardDescription>
            {tab === "current" ? "Current quantity" : "Initial quantity"} across
            all locations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="sticky left-0 z-10 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                    Farmer
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Account #
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Passes
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Bags
                  </TableHead>
                  <TableHead className="h-10 bg-primary/5 px-3 text-right font-medium text-muted-foreground">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  const isSelected = row.farmerId === selectedFarmerId

                  return (
                    <TableRow
                      key={row.farmerId}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/5 hover:bg-primary/10",
                      )}
                      onClick={() => setSelectedFarmerId(row.farmerId)}
                    >
                      <TableCell
                        className={cn(
                          "sticky left-0 z-10 bg-background px-3 py-2.5 font-medium",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                        title={row.farmerName}
                      >
                        <span className="block truncate">{row.farmerName}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.accountNumber}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.orderCount}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {formatQuantity(row.totalBags)}
                      </TableCell>
                      <TableCell className="bg-primary/5 px-3 py-2.5 text-right font-medium tabular-nums text-primary">
                        {formatShare(row.share)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>

              <TableFooter className="bg-muted/30">
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-muted/30 px-3 py-2.5 font-semibold text-foreground">
                    Total
                  </TableCell>
                  <TableCell />
                  <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {rows.reduce((sum, row) => sum + row.orderCount, 0)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {formatQuantity(tableTotal)}
                  </TableCell>
                  <TableCell className="bg-primary/5 px-3 py-2.5 text-right font-semibold tabular-nums text-primary">
                    {formatShare(100)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedFarmer ? (
        <FarmerOrderDetail farmer={selectedFarmer} tab={tab} />
      ) : (
        <Empty className="rounded-xl border border-dashed border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>Select a farmer</EmptyTitle>
            <EmptyDescription>
              Tap a row in the table above to view gate pass details.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
