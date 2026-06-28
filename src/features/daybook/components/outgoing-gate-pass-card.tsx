import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  Ban,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
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
import { FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { useColdStorageStore } from "@/features/auth/store/use-cold-storage-store"
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
import {
  isOutgoingTransferType,
  TransferGatePassBadge,
} from "@/features/daybook/components/transfer-gate-pass-badge"
import { useNullOutgoingGatePass } from "@/features/outgoing/api/use-null-outgoing-gate-pass"

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
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [remarks, setRemarks] = useState("")
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name)
  const coldStorageAddress = useColdStorageStore(
    (state) => state.coldStorage?.address,
  )
  const coldStorageLogo = useColdStorageStore(
    (state) => state.coldStorage?.imageUrl,
  )
  const { mutateAsync: nullOutgoingGatePass, isPending: isNulling } =
    useNullOutgoingGatePass()

  const handleCancelOpenChange = (open: boolean) => {
    if (!open) {
      setRemarks("")
    }
    setCancelOpen(open)
  }

  const handleNullConfirm = async () => {
    const trimmed = remarks.trim()
    const payload = trimmed ? { remarks: trimmed } : {}

    try {
      await nullOutgoingGatePass({ id: entry._id, payload })
      toast.success(
        `OGP #${entry.gatePassNo.toLocaleString("en-IN")} marked as null`,
        { position: "bottom-right" }
      )
      setRemarks("")
      setCancelOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to null outgoing gate pass",
        { position: "bottom-right" }
      )
    }
  }

  const farmerLink = entry.farmerStorageLinkId
  const manualParchi = formatManualParchi(entry.manualParchiNumber)
  const orderDetails = entry.orderDetails ?? []
  const snapshots = entry.incomingGatePassSnapshots ?? []
  const totalIssued = sumBagQuantities(orderDetails, "quantityIssued")
  const primaryVariety =
    entry.variety ?? snapshots[0]?.variety ?? "—"
  const isTransfer = isOutgoingTransferType(entry.type)
  const truckNumber = entry.truckNumber?.trim()
  const fromLocation = entry.from?.trim()
  const toLocation = entry.to?.trim()
  const hasRouteDetails = Boolean(fromLocation || toLocation || truckNumber)
  const isNull = entry.isNull === true
  const entryRemarks = entry.remarks?.trim() || "—"
  const hasRemarks = entryRemarks !== "—"
  const breakdownRows = useMemo(() => buildBreakdownRows(entry), [entry])

  const handlePrint = useCallback(async () => {
    if (!coldStorageName) {
      toast.error("Cold storage details are not ready yet.", {
        position: "bottom-right",
      })
      return
    }

    try {
      setIsGeneratingPdf(true)

      const { generateOutgoingGatePassPdf } = await import(
        "@/features/daybook/utils/generate-outgoing-gate-pass-pdf"
      )

      const blob = await generateOutgoingGatePassPdf({
        entry,
        coldStorageName,
        coldStorageAddress,
        coldStorageLogo: coldStorageLogo || undefined,
      })

      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast.error("Failed to generate PDF. Please try again.", {
        position: "bottom-right",
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }, [coldStorageAddress, coldStorageLogo, coldStorageName, entry])

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60",
        isNull
          ? "border-dashed bg-muted/20 opacity-80"
          : "card-hover"
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between",
          isNull
            ? "border-border/30 bg-muted/30"
            : "border-border/40 bg-muted/10"
        )}
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle
              className={cn(
                "flex items-center gap-2 text-lg",
                isNull && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isNull
                    ? "bg-muted-foreground/50"
                    : "bg-rose-700 dark:bg-rose-500"
                )}
              />
              OGP{" "}
              <span
                className={cn(
                  "font-mono tabular-nums",
                  isNull
                    ? "text-muted-foreground line-through decoration-muted-foreground/60"
                    : "text-rose-700 dark:text-rose-400"
                )}
              >
                #{entry.gatePassNo}
              </span>
            </CardTitle>
            {isNull && (
              <Badge
                variant="secondary"
                className="gap-1 bg-muted text-muted-foreground"
              >
                <Ban className="size-3 shrink-0" aria-hidden />
                Null
              </Badge>
            )}
            {manualParchi !== "—" && (
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-xs tabular-nums uppercase",
                  isNull ? "border-border/40 bg-muted/40 text-muted-foreground" : "bg-background"
                )}
              >
                Manual: {manualParchi}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {formatDaybookDateTime(entry.createdAt)}
            {isNull && entry.nulledAt && (
              <>
                {" · "}
                Nulled {formatDaybookDateTime(entry.nulledAt)}
              </>
            )}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isNull
                ? "border-border/40 bg-muted/40 text-muted-foreground"
                : "bg-background"
            )}
            title={primaryVariety}
          >
            {primaryVariety}
          </Badge>
          {isTransfer ? (
            <TransferGatePassBadge
              bagCount={totalIssued}
              typeLabel={entry.type ?? "Outgoing-transfer"}
              tone="outgoing"
            />
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "text-xs tabular-nums",
                isNull
                  ? "border-border/40 bg-muted/40 text-muted-foreground"
                  : "bg-background"
              )}
            >
              {formatQuantity(totalIssued)} Bags issued
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          isNull && !isExpanded && !hasRemarks ? "hidden" : "pt-5"
        )}
      >
        {isNull && !isExpanded ? (
          hasRemarks ? (
            <div className="flex w-full items-start gap-2.5 rounded-lg border border-dashed border-border/40 bg-muted/25 px-3 py-2.5">
              <FileText
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Null remarks
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
                  {entryRemarks}
                </p>
              </div>
            </div>
          ) : null
        ) : (
          <>
            {!isNull && (
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
            )}

            {isExpanded && (
              <div
                className={cn(
                  "animate-in fade-in slide-in-from-top-4 duration-300",
                  !isNull && "mt-6"
                )}
              >
                {!isNull && <Separator className="mb-6" />}
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
                  <p className="text-sm italic text-muted-foreground">{entryRemarks}</p>
                </div>
              </div>

              {entry.createdBy && (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <InfoBlock label="Created by" value={entry.createdBy.name} />
                </div>
              )}

              {isNull && entry.nulledBy && (
                <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 p-4">
                  <InfoBlock label="Nulled by" value={entry.nulledBy.name} />
                </div>
              )}
            </div>
          </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter
        className={cn(
          "flex items-center justify-between border-t px-4 py-3",
          isNull
            ? "border-border/30 bg-muted/30"
            : "border-border/40 bg-muted/10"
        )}
      >
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
          {!isNull && (
            <>
              <Button
                variant="secondary"
                size="icon-sm"
                className="h-8 w-8"
                aria-label={`Edit outgoing gate pass ${entry.gatePassNo}`}
                onClick={() =>
                  navigate({
                    to: "/outgoing/$id",
                    params: { id: entry._id },
                  })
                }
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
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            disabled={isGeneratingPdf || !coldStorageName}
            onClick={() => void handlePrint()}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Printer className="mr-2 h-3.5 w-3.5" />
                Print
              </>
            )}
          </Button>
        </div>
      </CardFooter>

      <AlertDialog open={cancelOpen} onOpenChange={handleCancelOpenChange}>
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
            <FieldLabel htmlFor={`cancel-remarks-${entry._id}`}>
              Cancellation remarks
            </FieldLabel>
            <Textarea
              id={`cancel-remarks-${entry._id}`}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="e.g. Issued in error — wrong truck and quantity"
              className="min-h-[88px] resize-y"
              disabled={isNulling}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isNulling}>Keep active</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!remarks.trim() || isNulling}
              onClick={() => void handleNullConfirm()}
            >
              {isNulling ? "Marking as null…" : "Mark as null"}
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
