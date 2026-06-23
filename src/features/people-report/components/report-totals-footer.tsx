import type { ReactNode } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

import { TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { formatQuantity } from "@/features/daybook/utils/format"
import type {
  FarmerReportSectionMode,
  FarmerReportTableRow,
} from "@/features/people-report/utils/build-farmer-report-sections"
import { sumSizeColumn } from "@/features/people-report/utils/gate-pass-table-helpers"
import { cn } from "@/lib/utils"

import {
  CLOSING_BALANCE_ROW_CLASS,
  getFooterClassName,
  INCOMING_TOTAL_ROW_CLASS,
} from "./table-styles"

type ReportTotalsFooterProps = {
  table: TanStackTable<FarmerReportTableRow>
  rows: FarmerReportTableRow[]
  sectionMode: FarmerReportSectionMode
  isFooterElevated: boolean
}

function getGatePassRows(rows: FarmerReportTableRow[]): FarmerReportTableRow[] {
  return rows.filter((row) => row.kind === "gate-pass" && row.entry)
}

function getOpeningBalanceRow(
  rows: FarmerReportTableRow[],
): FarmerReportTableRow | undefined {
  return rows.find((row) => row.kind === "opening-balance")
}

function getClosingBalanceForSize(
  rows: FarmerReportTableRow[],
  size: string,
): number {
  const openingRow = getOpeningBalanceRow(rows)
  const gatePassRows = getGatePassRows(rows)
  const openingTotal = openingRow?.sizeTotals?.[size] ?? 0
  const outgoingTotal = sumSizeColumn(
    gatePassRows.map((row) => row.entry!),
    size,
  )

  return openingTotal - outgoingTotal
}

function getFooterCellContent(
  columnId: string,
  columnIndex: number,
  rows: FarmerReportTableRow[],
  sectionMode: FarmerReportSectionMode,
): ReactNode {
  const gatePassRows = getGatePassRows(rows)
  const footerLabel = sectionMode === "outgoing" ? "Closing Balance" : "Total"

  if (columnIndex === 0) {
    return (
      <span className="font-semibold text-primary">{footerLabel}</span>
    )
  }

  if (columnId === "totalBags") {
    const closingBalance = rows[rows.length - 1]?.runningTotal ?? 0
    return (
      <span className="tabular-nums font-semibold text-foreground">
        {formatQuantity(closingBalance)}
      </span>
    )
  }

  if (columnId.startsWith("size-")) {
    const size = columnId.slice("size-".length)

    if (sectionMode === "outgoing") {
      const closingBalance = getClosingBalanceForSize(rows, size)
      return (
        <span className="tabular-nums font-semibold text-foreground">
          {closingBalance !== 0 ? formatQuantity(closingBalance) : "—"}
        </span>
      )
    }

    const entries = gatePassRows.map((row) => row.entry!)
    const total = sumSizeColumn(entries, size)
    return (
      <span className="tabular-nums font-semibold text-foreground">
        {total > 0 ? formatQuantity(total) : "—"}
      </span>
    )
  }

  return null
}

export function ReportTotalsFooter({
  table,
  rows,
  sectionMode,
  isFooterElevated,
}: ReportTotalsFooterProps) {
  if (rows.length === 0) return null

  const visibleColumns = table.getVisibleLeafColumns()

  const footerRowClassName =
    sectionMode === "outgoing"
      ? CLOSING_BALANCE_ROW_CLASS
      : INCOMING_TOTAL_ROW_CLASS

  return (
    <TableFooter
      className={cn(
        "sticky bottom-0 z-10 border-t-0 backdrop-blur-sm supports-backdrop-filter:bg-transparent",
        isFooterElevated && "shadow-[0_-1px_0_0] shadow-border/80",
      )}
    >
      <TableRow className={footerRowClassName}>
        {visibleColumns.map((column, columnIndex) => (
          <TableCell
            key={column.id}
            className={getFooterClassName(column.columnDef.meta)}
          >
            {getFooterCellContent(column.id, columnIndex, rows, sectionMode)}
          </TableCell>
        ))}
      </TableRow>
    </TableFooter>
  )
}
