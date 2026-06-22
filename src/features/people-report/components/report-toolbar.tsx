import { useState, type ReactNode } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { DatePickerInput } from "@/components/date-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDateParam, parseDateParam } from "@/features/people/search"

type ReportToolbarProps = {
  appliedFrom?: string
  appliedTo?: string
  onApplyDates: (from?: string, to?: string) => void
  onResetDates: () => void
  rowCount: number
  isLoading?: boolean
  isFetching?: boolean
  onRefresh: () => void
}

function formatAppliedDateLabel(value?: string): string | null {
  if (!value) return null

  const date = parseDateParam(value)
  if (!date) return value

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function ReportToolbar({
  appliedFrom,
  appliedTo,
  onApplyDates,
  onResetDates,
  rowCount,
  isLoading = false,
  isFetching = false,
  onRefresh,
}: ReportToolbarProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(() =>
    parseDateParam(appliedFrom),
  )
  const [toDate, setToDate] = useState<Date | undefined>(() =>
    parseDateParam(appliedTo),
  )

  const fromLabel = formatAppliedDateLabel(appliedFrom)
  const toLabel = formatAppliedDateLabel(appliedTo)
  const hasActiveDates = Boolean(fromLabel || toLabel)
  const hasDraftDates = Boolean(fromDate || toDate)
  const hasAppliedDates = Boolean(appliedFrom || appliedTo)
  const isDisabled = isLoading

  return (
    <div className="space-y-3 bg-muted/20 p-3 sm:space-y-4 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
            <DatePickerInput
              id="farmer-report-from"
              placeholder="From date"
              value={fromDate}
              onChange={setFromDate}
              disabled={isDisabled}
              className="min-w-0 sm:w-36"
            />

            <DatePickerInput
              id="farmer-report-to"
              placeholder="To date"
              value={toDate}
              onChange={setToDate}
              disabled={isDisabled}
              className="min-w-0 sm:w-36"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="min-h-9 flex-1 sm:flex-none"
              disabled={isDisabled || (!hasDraftDates && !hasAppliedDates)}
              onClick={() =>
                onApplyDates(
                  fromDate ? formatDateParam(fromDate) : undefined,
                  toDate ? formatDateParam(toDate) : undefined,
                )
              }
            >
              Apply dates
            </Button>
            {(hasDraftDates || hasAppliedDates) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9 flex-1 sm:flex-none"
                disabled={isDisabled}
                onClick={() => {
                  setFromDate(undefined)
                  setToDate(undefined)
                  onResetDates()
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onRefresh}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="tabular-nums font-normal">
          {rowCount} gate pass{rowCount === 1 ? "" : "es"}
        </Badge>
        {hasActiveDates ? (
          <>
            {fromLabel ? (
              <Badge variant="outline" className="font-normal tabular-nums">
                From {fromLabel}
              </Badge>
            ) : null}
            {toLabel ? (
              <Badge variant="outline" className="font-normal tabular-nums">
                To {toLabel}
              </Badge>
            ) : null}
          </>
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
      <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
            Stock Ledger
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rowCount} gate pass{rowCount === 1 ? "" : "es"} for this farmer
          </p>
        </div>
      </div>

      <Separator />

      {children}
    </div>
  )
}
