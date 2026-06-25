import { useMemo, type ReactNode } from "react"
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

function buildFooterCellContent(
  columnId: string,
  columnIndex: number,
  rows: FarmerReportTableRow[],
  sectionMode: FarmerReportSectionMode,
  gatePassRows: FarmerReportTableRow[],
): ReactNode {
  const footerLabel = sectionMode === "outgoing" ? "Closing Balance" : "Total"

  if (columnIndex === 0) {
    return (
      <span className="font-semibold text-primary">{footerLabel}</span>
    )
  }

  if (columnId === "rowBags") {
    const total = gatePassRows.reduce((sum, row) => sum + row.rowBags, 0)
    return (
      <span className="tabular-nums font-semibold text-foreground">
        {total > 0 ? formatQuantity(total) : "—"}
      </span>
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

    const total = sumSizeColumn(
      gatePassRows.map((row) => row.entry!),
      size,
    )
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
  const visibleColumns = table.getVisibleLeafColumns()

  const footerCells = useMemo(() => {
    const gatePassRows = getGatePassRows(rows)

    return visibleColumns.map((column, columnIndex) => ({
      columnId: column.id,
      meta: column.columnDef.meta,
      content: buildFooterCellContent(
        column.id,
        columnIndex,
        rows,
        sectionMode,
        gatePassRows,
      ),
    }))
  }, [rows, sectionMode, visibleColumns])

  if (rows.length === 0) return null

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
        {footerCells.map((cell) => (
          <TableCell
            key={cell.columnId}
            className={getFooterClassName(cell.meta)}
          >
            {cell.content}
          </TableCell>
        ))}
      </TableRow>
    </TableFooter>
  )
}
