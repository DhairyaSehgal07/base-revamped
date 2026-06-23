import { useState, type ReactNode } from "react"
import { Loader2, RefreshCw, Table2 } from "lucide-react"
import type { GroupingState } from "@tanstack/react-table"

import { DatePickerInput } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDateParam, parseDateParam } from "@/features/people/search"
import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  isFarmerReportGrouped,
  type FarmerReportGroupColumnId,
} from "@/features/people-report/utils/report-grouping"
import { FarmerStockLedgerPdfButton } from "@/features/people-report/components/farmer-stock-ledger-pdf-button"
import type { FarmerStockLedgerPdfData } from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"
import { cn } from "@/lib/utils"

type ReportToolbarProps = {
  appliedFrom?: string
  appliedTo?: string
  onApplyDates: (from?: string, to?: string) => void
  onResetDates: () => void
  grouping: GroupingState
  showStockFilterGrouping: boolean
  onToggleGrouping: (columnId: FarmerReportGroupColumnId) => void
  isLoading?: boolean
  isFetching?: boolean
  onRefresh: () => void
  pdfData: FarmerStockLedgerPdfData | null
  pdfDisabled?: boolean
}

export function ReportToolbar({
  appliedFrom,
  appliedTo,
  onApplyDates,
  onResetDates,
  grouping,
  showStockFilterGrouping,
  onToggleGrouping,
  isLoading = false,
  isFetching = false,
  onRefresh,
  pdfData,
  pdfDisabled = false,
}: ReportToolbarProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(() =>
    parseDateParam(appliedFrom),
  )
  const [toDate, setToDate] = useState<Date | undefined>(() =>
    parseDateParam(appliedTo),
  )

  const hasDraftDates = Boolean(fromDate || toDate)
  const hasAppliedDates = Boolean(appliedFrom || appliedTo)
  const isDisabled = isLoading
  const isVarietyGrouped = isFarmerReportGrouped(
    grouping,
    FARMER_REPORT_GROUP_COLUMN_IDS.variety,
  )
  const isStockFilterGrouped = isFarmerReportGrouped(
    grouping,
    FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter,
  )

  const handleReset = () => {
    setFromDate(undefined)
    setToDate(undefined)
    onResetDates()
  }

  return (
    <div className="border-t border-border bg-muted/20">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="farmer-report-from"
              className="text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <DatePickerInput
              id="farmer-report-from"
              placeholder="dd/mm/yyyy"
              value={fromDate}
              onChange={setFromDate}
              disabled={isDisabled}
              className="min-w-34 sm:w-36"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="farmer-report-to"
              className="text-xs font-medium text-muted-foreground"
            >
              To
            </label>
            <DatePickerInput
              id="farmer-report-to"
              placeholder="dd/mm/yyyy"
              value={toDate}
              onChange={setToDate}
              disabled={isDisabled}
              className="min-w-34 sm:w-36"
            />
          </div>

          <Button
            type="button"
            size="sm"
            className="min-h-9"
            disabled={isDisabled || (!hasDraftDates && !hasAppliedDates)}
            onClick={() =>
              onApplyDates(
                fromDate ? formatDateParam(fromDate) : undefined,
                toDate ? formatDateParam(toDate) : undefined,
              )
            }
          >
            Apply
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9"
            disabled={isDisabled || (!hasDraftDates && !hasAppliedDates)}
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end lg:self-auto">
          <FarmerStockLedgerPdfButton pdfData={pdfData} disabled={pdfDisabled} />
          <Button
            type="button"
            size="sm"
            className="min-h-9 shrink-0"
            onClick={() => window.alert("Excel export coming soon.")}
          >
            <Table2 className="mr-2 size-4" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Refresh report"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-5">
        <Button
          type="button"
          size="sm"
          variant={isVarietyGrouped ? "secondary" : "outline"}
          className={cn("min-h-9", isVarietyGrouped && "ring-1 ring-border")}
          disabled={isDisabled}
          onClick={() =>
            onToggleGrouping(FARMER_REPORT_GROUP_COLUMN_IDS.variety)
          }
          aria-pressed={isVarietyGrouped}
        >
          {isVarietyGrouped ? "Ungroup Variety" : "Group by Variety"}
        </Button>
        {showStockFilterGrouping ? (
          <Button
            type="button"
            size="sm"
            variant={isStockFilterGrouped ? "secondary" : "outline"}
            className={cn(
              "min-h-9",
              isStockFilterGrouped && "ring-1 ring-border",
            )}
            disabled={isDisabled}
            onClick={() =>
              onToggleGrouping(FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter)
            }
            aria-pressed={isStockFilterGrouped}
          >
            {isStockFilterGrouped
              ? "Ungroup Stock Filter"
              : "Group by Stock Filter"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function ReportHeaderCard({
  rowCount,
  children,
}: {
  rowCount: number
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Stock Ledger
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rowCount} gate pass{rowCount === 1 ? "" : "es"} for this farmer
          </p>
        </div>
      </div>

      {children}
    </div>
  )
}
