import type { ReactNode } from "react"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Package2,
  Scale,
  User2,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { IncomingFormValues } from "@/features/incoming/types"
import { formatInr } from "@/features/finances/shared/format-currency"
import { cn } from "@/lib/utils"

export type IncomingSummaryValues = IncomingFormValues

type IncomingSummarySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: IncomingSummaryValues | null
  farmerLabel: string
  costPerBag?: number
  showCommodity?: boolean
  onBack: () => void
  onSubmit: () => void
  canSubmit: boolean
  isSubmitting: boolean
  submitLabel?: string
}

function formatReviewDate(iso: string) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function DetailRow({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string
  value: ReactNode
  icon?: LucideIcon
  valueClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {label}
      </span>
      <span
        className={cn(
          "text-right text-sm font-medium text-foreground",
          valueClassName
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  )
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span className="text-[11px] font-bold tracking-widest text-foreground/70 uppercase">
        {children}
      </span>
    </div>
  )
}

function SummaryCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border/40 rounded-xl border border-border/50 bg-card px-4",
        className
      )}
    >
      {children}
    </div>
  )
}

function activeQuantityRows(quantities: IncomingSummaryValues["quantities"]) {
  return quantities.filter((row) => (row.qty ?? 0) > 0)
}

function formatLocationCell(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : "—"
}

function IncomingReviewSummary({
  values,
  farmerLabel,
  costPerBag,
  showCommodity = false,
}: {
  values: IncomingSummaryValues
  farmerLabel: string
  costPerBag?: number
  showCommodity?: boolean
}) {
  const rows = activeQuantityRows(values.quantities)
  const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0)
  const showTotalRent = typeof costPerBag === "number"
  const totalRent = showTotalRent ? totalBags * costPerBag : 0

  const hasPassMeta =
    values.gatePassNo > 0 ||
    values.manualGatePassNumber != null ||
    Boolean(values.stockFilter)

  return (
    <div className="space-y-7">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-primary/[0.07] via-card to-muted/25 shadow-sm">
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset">
              <Package2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <h3
                className="font-heading truncate text-base font-semibold tracking-tight text-foreground"
                title={values.variety}
              >
                {values.variety}
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span>{formatReviewDate(values.date)}</span>
              </p>
            </div>
          </div>

          {hasPassMeta ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/35 pt-3.5">
              {values.gatePassNo > 0 ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/30 bg-primary/5 px-2.5 font-normal"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span className="text-foreground/80">IGP</span>
                  <span className="font-mono font-semibold tabular-nums text-primary">
                    #{values.gatePassNo.toLocaleString("en-IN")}
                  </span>
                </Badge>
              ) : null}
              {values.manualGatePassNumber != null && (
                <Badge
                  variant="outline"
                  className="gap-1 bg-background/80 px-2.5 font-normal"
                >
                  <span className="text-muted-foreground">Manual</span>
                  <span className="font-mono tabular-nums text-foreground">
                    #{values.manualGatePassNumber.toLocaleString("en-IN")}
                  </span>
                </Badge>
              )}
              {values.stockFilter ? (
                <Badge
                  variant="secondary"
                  className="max-w-full truncate bg-background/60 px-2.5 font-normal"
                  title={values.stockFilter}
                >
                  {values.stockFilter}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={User2}>Farmer</SectionLabel>
        <SummaryCard>
          <DetailRow
            label="Linked account"
            value={farmerLabel}
            icon={User2}
          />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Package2}>Crop details</SectionLabel>
        <SummaryCard>
          {showCommodity && values.commodity ? (
            <DetailRow label="Commodity" value={values.commodity} />
          ) : null}
          <DetailRow label="Variety" value={values.variety} />
          {values.stockFilter ? (
            <DetailRow label="Stock filter" value={values.stockFilter} />
          ) : null}
          {values.customMarka ? (
            <DetailRow label="Custom marka" value={values.customMarka} />
          ) : null}
          <DetailRow
            label="Date"
            value={formatReviewDate(values.date)}
            icon={Calendar}
          />
          {values.truckNumber.trim() ? (
            <DetailRow label="Truck number" value={values.truckNumber.trim()} />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Bag quantities</SectionLabel>
        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr className="text-left">
                  <th className="h-10 px-3 font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="h-10 px-3 font-medium text-muted-foreground">
                    Chamber
                  </th>
                  <th className="h-10 px-3 font-medium text-muted-foreground">
                    Floor
                  </th>
                  <th className="h-10 px-3 font-medium text-muted-foreground">
                    Row
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.size}-${index}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.size}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {(row.qty ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {formatLocationCell(row.chamber)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {formatLocationCell(row.floor)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {formatLocationCell(row.row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No bag quantities entered.
            </p>
          </div>
        )}

        <SummaryCard className="mt-3">
          <DetailRow
            label="Total bags"
            value={totalBags.toLocaleString("en-IN")}
            icon={Warehouse}
            valueClassName="font-semibold tabular-nums"
          />
          {showTotalRent ? (
            <DetailRow
              label="Total rent"
              value={
                <>
                  <span className="block font-semibold tabular-nums">
                    {formatInr(totalRent)}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground">
                    ({totalBags.toLocaleString("en-IN")} × {formatInr(costPerBag)})
                  </span>
                </>
              }
              icon={Scale}
            />
          ) : null}
        </SummaryCard>
      </div>

      {values.remarks.trim() ? (
        <div className="space-y-2">
          <SectionLabel icon={FileText}>Remarks</SectionLabel>
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
              {values.remarks}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function IncomingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerLabel,
  costPerBag,
  showCommodity = false,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
  submitLabel = "Confirm & submit",
}: IncomingSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none font-semibold">
                Review incoming pass
              </SheetTitle>
              <SheetDescription className="text-xs leading-snug text-muted-foreground">
                Verify all fields before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <IncomingReviewSummary
              values={values}
              farmerLabel={farmerLabel}
              costPerBag={costPerBag}
              showCommodity={showCommodity}
            />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 px-6 text-center">
              <Package2 className="size-7 text-muted-foreground/40" />
              <p className="text-sm font-medium">No summary available</p>
              <p className="text-xs text-muted-foreground">
                Complete the form and open review again.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2.5 border-t border-border/40 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              "Submitting…"
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                {submitLabel}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
