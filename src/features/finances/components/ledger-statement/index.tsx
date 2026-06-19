import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LedgerStatementTable } from "@/features/finances/components/reports/ledger-statement-table"
import { ReportStateCard } from "@/features/finances/components/reports/report-state-card"
import { useLedgerStatement } from "@/features/finances/hooks/use-ledger-statement"
import {
  formatPeriodRangeLabel,
} from "@/features/finances/hooks/use-report-date-range"
import type { PeriodFilter } from "@/features/finances/shared/constants"
import { PERIOD_LABELS } from "@/features/finances/shared/constants"
import { formatCurrency } from "@/features/finances/shared/format-currency"

type LedgerStatementPageProps = {
  ledgerId: string
  period: PeriodFilter
}

export function LedgerStatementPage({
  ledgerId,
  period,
}: LedgerStatementPageProps) {
  const { report, isLoading, isError, error } = useLedgerStatement(
    ledgerId,
    period
  )

  if (isLoading) {
    return <ReportStateCard variant="loading" message="Loading ledger statement…" />
  }

  if (isError) {
    return (
      <ReportStateCard
        variant="error"
        message={error instanceof Error ? error.message : "Failed to load ledger statement"}
      />
    )
  }

  if (!report) {
    return (
      <ReportStateCard
        variant="empty"
        title="Ledger not found"
        message="The selected ledger could not be loaded."
      />
    )
  }

  const periodLabel = `${PERIOD_LABELS[period]} (${formatPeriodRangeLabel(period)})`

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" className="w-fit" asChild>
        <Link to="/finances" search={{ tab: "ledgers", period }}>
          <ArrowLeft className="size-4" />
          Back to Ledgers
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-primary px-4 py-4 text-primary-foreground sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-xl font-semibold text-primary-foreground">
                Statement of Account
              </CardTitle>
              <p className="mt-1 text-base font-medium">{report.ledger.name}</p>
            </div>
            <p className="text-sm opacity-90">Period: {periodLabel}</p>
          </div>
        </CardHeader>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-3 sm:px-6">
          <span className="text-sm font-medium">
            {report.ledger.name} [{report.ledger.type}]
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(Math.abs(report.closingBalance))}{" "}
            {report.isDebitBalance ? "Dr" : "Cr"}
          </span>
        </div>

        <CardContent className="p-4 sm:p-6">
          <LedgerStatementTable statement={report} />
        </CardContent>

        <div className="border-t border-border bg-muted/50 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-semibold">Closing Balance:</span>
            <span className="text-xl font-semibold tabular-nums text-primary">
              {formatCurrency(Math.abs(report.closingBalance))}{" "}
              {report.isDebitBalance ? "Dr" : "Cr"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
