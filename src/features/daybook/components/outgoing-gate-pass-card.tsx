import { useMemo, useState } from "react"
import {
  Ban,
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Printer,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type {
  IncomingGatePassSnapshot,
  OutgoingDaybookEntry,
  OutgoingOrderDetail,
} from "@/features/daybook/types"
import {
  formatDaybookDateTime,
  formatLocation,
  formatManualParchi,
  formatQuantity,
  locationKey,
  sumBagQuantities,
} from "@/features/daybook/utils/format"

interface InfoBlockProps {
  label: string
  value: string | number
  icon?: LucideIcon
  valueClassName?: string
}

const InfoBlock = ({
  label,
  value,
  icon: Icon,
  valueClassName,
}: InfoBlockProps) => (
  <div className="space-y-1.5">
    <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <p className={cn("text-sm font-semibold text-foreground", valueClassName)}>
      {value}
    </p>
  </div>
)

type BreakdownRow = {
  key: string
  size: string
  variety: string
  location: string
  refGatePassNo: number | null
  available: number
  issued: number
}

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingOrderDetail
): IncomingGatePassSnapshot | undefined {
  const key = `${orderLine.size}\u001f${locationKey(orderLine.location)}`

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some(
      (bag) =>
        `${bag.name}\u001f${locationKey(bag.location)}` === key
    )
  )
}

function buildBreakdownRows(entry: OutgoingDaybookEntry): BreakdownRow[] {
  const orderDetails = entry.orderDetails ?? []
  const snapshots = entry.incomingGatePassSnapshots ?? []

  return orderDetails.map((orderLine, index) => {
    const snapshot = findSnapshotForOrderLine(snapshots, orderLine)

    return {
      key: `${orderLine.size}-${locationKey(orderLine.location)}-${index}`,
      size: orderLine.size,
      variety: snapshot?.variety ?? "—",
      location: formatLocation(orderLine.location),
      refGatePassNo: snapshot?.gatePassNo ?? null,
      available: orderLine.quantityAvailable,
      issued: orderLine.quantityIssued,
    }
  })
}

interface OutgoingDetailedBreakdownProps {
  rows: BreakdownRow[]
}

function OutgoingDetailedBreakdown({ rows }: OutgoingDetailedBreakdownProps) {
  const totals = rows.reduce(
    (acc, row) => ({
      available: acc.available + row.available,
      issued: acc.issued + row.issued,
    }),
    { available: 0, issued: 0 }
  )

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Detailed breakdown
      </h4>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full min-w-[640px] caption-bottom text-sm">
          <thead className="border-b border-border/50 bg-muted/50">
            <tr>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Size
              </th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Variety
              </th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Location
              </th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                Ref
              </th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                Avail
              </th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                Issued
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {row.size}
                </td>
                <td className="px-3 py-2.5 text-foreground">{row.variety}</td>
                <td className="px-3 py-2.5 font-mono text-sm text-foreground">
                  {row.location}
                </td>
                <td className="px-3 py-2.5">
                  {row.refGatePassNo !== null ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums text-foreground">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      #{row.refGatePassNo}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {formatQuantity(row.available)}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-destructive">
                  {formatQuantity(row.issued)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border/50 bg-muted/30">
            <tr>
              <td
                colSpan={4}
                className="px-3 py-2.5 text-sm font-semibold text-destructive"
              >
                Total
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-destructive">
                {formatQuantity(totals.available)}
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-destructive">
                {formatQuantity(totals.issued)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

interface OutgoingGatePassCardProps {
  entry: OutgoingDaybookEntry
}

export function OutgoingGatePassCard({ entry }: OutgoingGatePassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [remarks, setRemarks] = useState("")

  const farmerLink = entry.farmerStorageLinkId
  const manualParchi = formatManualParchi(entry.manualParchiNumber)
  const orderDetails = entry.orderDetails ?? []
  const snapshots = entry.incomingGatePassSnapshots ?? []
  const totalIssued = sumBagQuantities(orderDetails, "quantityIssued")
  const primaryVariety =
    entry.variety ?? snapshots[0]?.variety ?? "—"
  const isTransfer = entry.type === "Outgoing-transfer"
  const truckNumber = entry.truckNumber?.trim()
  const fromLocation = entry.from?.trim()
  const toLocation = entry.to?.trim()
  const hasRouteDetails = Boolean(fromLocation || toLocation || truckNumber)
  const entryRemarks = entry.remarks?.trim() || "—"
  const breakdownRows = useMemo(() => buildBreakdownRows(entry), [entry])

  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-rose-700 dark:bg-rose-500" />
              OGP{" "}
              <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                #{entry.gatePassNo}
              </span>
            </CardTitle>
            {manualParchi !== "—" && (
              <Badge
                variant="outline"
                className="bg-background font-mono text-xs tabular-nums uppercase"
              >
                Manual: {manualParchi}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {formatDaybookDateTime(entry.createdAt)}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="bg-background text-xs"
            title={primaryVariety}
          >
            {primaryVariety}
          </Badge>
          {isTransfer && (
            <Badge
              variant="outline"
              className="bg-background text-xs"
              title="Transfer"
            >
              Transfer
            </Badge>
          )}
          <Badge
            variant="outline"
            className="bg-background text-xs tabular-nums"
          >
            {formatQuantity(totalIssued)} Bags issued
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBlock label="Farmer" value={farmerLink.name} icon={User} />
          <InfoBlock
            label="Account"
            value={farmerLink.accountNumber}
            valueClassName="tabular-nums"
          />
          {fromLocation && (
            <InfoBlock label="From" value={fromLocation} icon={Truck} />
          )}
          {toLocation && <InfoBlock label="To" value={toLocation} />}
          {truckNumber && (
            <InfoBlock
              label="Truck"
              value={truckNumber}
              valueClassName="font-mono uppercase"
            />
          )}
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="space-y-6">
              <OutgoingDetailedBreakdown rows={breakdownRows} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-rose-700 dark:text-rose-500" />
                    Farmer information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="Name" value={farmerLink.name} />
                    <InfoBlock label="Mobile" value={farmerLink.mobileNumber} />
                    <div className="col-span-2">
                      <InfoBlock label="Address" value={farmerLink.address} />
                    </div>
                  </div>
                </div>

                {hasRouteDetails && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Truck className="h-4 w-4 text-rose-700 dark:text-rose-500" />
                      Route &amp; vehicle
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                      {fromLocation && (
                        <InfoBlock label="From" value={fromLocation} />
                      )}
                      {toLocation && <InfoBlock label="To" value={toLocation} />}
                      {truckNumber && (
                        <InfoBlock
                          label="Truck"
                          value={truckNumber}
                          valueClassName="font-mono uppercase"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-rose-700 dark:text-rose-500" />
                  Remarks
                </h4>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">{entryRemarks}</p>
                </div>
              </div>

              {entry.createdBy && (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <InfoBlock label="Created by" value={entry.createdBy.name} />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              View less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              View full details
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8"
            aria-label={`Edit outgoing gate pass ${entry.gatePassNo}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-muted-foreground hover:text-destructive"
            aria-label={`Mark outgoing gate pass ${entry.gatePassNo} as null`}
            onClick={() => setCancelOpen(true)}
          >
            <Ban className="mr-2 h-3.5 w-3.5" />
            Mark as null
          </Button>
          <Button variant="secondary" size="sm" className="h-8">
            <Printer className="mr-2 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </CardFooter>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>
              Mark OGP #{entry.gatePassNo} as null?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stock on linked storage gate passes will be restored. This pass
              will be removed from the daybook.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label
              htmlFor={`cancel-remarks-${entry._id}`}
              className="text-sm font-medium text-foreground"
            >
              Cancellation remarks
            </label>
            <Textarea
              id={`cancel-remarks-${entry._id}`}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="e.g. Issued in error — wrong truck and quantity"
              className="min-h-[88px] resize-y text-base"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!remarks.trim()}
              onClick={() => setCancelOpen(false)}
            >
              Mark as null
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export function OutgoingGatePassCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  )
}
