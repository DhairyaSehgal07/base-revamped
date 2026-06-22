import type { ReactNode } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

import { TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { formatQuantity } from "@/features/daybook/utils/format"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import { sumSizeColumn } from "@/features/people-report/utils/gate-pass-table-helpers"
import { cn } from "@/lib/utils"

import { getFooterClassName } from "./table-styles"

type ReportTotalsFooterProps = {
  table: TanStackTable<FarmerReportTableRow>
  isFooterElevated: boolean
}

function getGatePassRows(rows: FarmerReportTableRow[]): FarmerReportTableRow[] {
  return rows.filter((row) => row.kind === "gate-pass" && row.entry)
}

function getFooterCellContent(
  columnId: string,
  rows: FarmerReportTableRow[],
): ReactNode {
  const gatePassRows = getGatePassRows(rows)

  if (columnId === "date") {
    return <span className="font-semibold text-foreground">Total</span>
  }

  if (columnId === "totalBags") {
    const closingBalance = rows[rows.length - 1]?.runningTotal ?? 0
    return (
      <span className="tabular-nums">{formatQuantity(closingBalance)}</span>
    )
  }

  if (columnId.startsWith("size-")) {
    const size = columnId.slice("size-".length)
    const entries = gatePassRows.map((row) => row.entry!)
    const total = sumSizeColumn(entries, size)
    return (
      <span className="tabular-nums">
        {total > 0 ? formatQuantity(total) : "—"}
      </span>
    )
  }

  return null
}

export function ReportTotalsFooter({
  table,
  isFooterElevated,
}: ReportTotalsFooterProps) {
  const filteredRows = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

  if (filteredRows.length === 0) return null

  const visibleColumns = table.getVisibleLeafColumns()

  return (
    <TableFooter
      className={cn(
        "sticky bottom-0 z-10 border-t-2 border-t-border bg-muted/80 backdrop-blur-sm supports-[backdrop-filter]:bg-muted/70",
        isFooterElevated && "shadow-[0_-1px_0_0] shadow-border/80",
      )}
    >
      <TableRow className="border-0 hover:bg-transparent">
        {visibleColumns.map((column) => (
          <TableCell
            key={column.id}
            className={getFooterClassName(column.columnDef.meta)}
          >
            {getFooterCellContent(column.id, filteredRows)}
          </TableCell>
        ))}
      </TableRow>
    </TableFooter>
  )
}
