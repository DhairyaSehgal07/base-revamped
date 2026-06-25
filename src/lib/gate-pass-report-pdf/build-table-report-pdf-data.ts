import { format } from "date-fns"
import type { Column, Row, Table } from "@tanstack/react-table"

import type {
  GatePassReportPdfCell,
  GatePassReportPdfData,
} from "@/lib/gate-pass-report-pdf/types"

type ExportCellValue =
  | { kind: "text"; value: string }
  | { kind: "number"; value: number; format: "integer" }
  | { kind: "empty" }

export type BuildTableReportPdfDataOptions<TRow> = {
  table: Table<TRow>
  reportTitle: string
  dateFrom?: string
  dateTo?: string
  generatedAt?: Date
  formatDateRangeLabel: (dateFrom?: string, dateTo?: string) => string
  getFilteredLeafRowCount: (table: Table<TRow>) => number
  buildFilterSummaryLines: (table: Table<TRow>) => string[]
  collectExportRows: (table: Table<TRow>) => Row<TRow>[]
  getColumnExportLabel: (column: Column<TRow, unknown>) => string
  getExportCellForRow: (
    row: Row<TRow>,
    column: Column<TRow, unknown>,
  ) => ExportCellValue
  getFooterExportValue: (
    columnId: string,
    rows: readonly Row<TRow>[],
  ) => ExportCellValue
  isSummableExportColumn: (columnId: string) => boolean
  exportCellValueToDisplay: (cell: ExportCellValue) => string
}

function toPdfCell(
  text: string,
  align: "left" | "right",
  isEmpty = false,
): GatePassReportPdfCell {
  return { text, align, isEmpty }
}

function cellFromExportValue(
  cell: ExportCellValue,
  align: "left" | "right",
): GatePassReportPdfCell {
  return toPdfCell(
    cell.kind === "empty" ? "—" : cell.kind === "number"
      ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
          cell.value,
        )
      : cell.value,
    align,
    cell.kind === "empty",
  )
}

export function buildTableReportPdfData<TRow>({
  table,
  reportTitle,
  dateFrom,
  dateTo,
  generatedAt = new Date(),
  formatDateRangeLabel,
  getFilteredLeafRowCount,
  buildFilterSummaryLines,
  collectExportRows,
  getColumnExportLabel,
  getExportCellForRow,
  getFooterExportValue,
  isSummableExportColumn,
  exportCellValueToDisplay,
}: BuildTableReportPdfDataOptions<TRow>): GatePassReportPdfData {
  const visibleColumns = table.getVisibleLeafColumns()
  const exportRows = collectExportRows(table)
  const filteredLeafCount = getFilteredLeafRowCount(table)
  const filteredRows = table.getFilteredRowModel().rows
  const filterSummaryLines = buildFilterSummaryLines(table)

  const columns = visibleColumns.map((column) => ({
    label: getColumnExportLabel(column),
    align: (column.columnDef.meta?.align === "right" ? "right" : "left") as
      | "left"
      | "right",
  }))

  const rows = exportRows.map((row) => ({
    isGroupRow: row.getIsGrouped(),
    cells: visibleColumns.map((column) => {
      const align = (column.columnDef.meta?.align === "right"
        ? "right"
        : "left") as "left" | "right"
      const exportCell = getExportCellForRow(row, column)
      return toPdfCell(
        exportCellValueToDisplay(exportCell),
        align,
        exportCell.kind === "empty",
      )
    }),
  }))

  const footerCells = visibleColumns.map((column, columnIndex) => {
    const align = (column.columnDef.meta?.align === "right"
      ? "right"
      : "left") as "left" | "right"

    if (columnIndex === 0) {
      return toPdfCell("Total", align)
    }

    if (isSummableExportColumn(column.id)) {
      return cellFromExportValue(
        getFooterExportValue(column.id, filteredRows),
        align,
      )
    }

    return toPdfCell("", align, true)
  })

  const entryCountLabel = `${filteredLeafCount.toLocaleString("en-IN")} ${
    filteredLeafCount === 1 ? "entry" : "entries"
  }`

  return {
    reportTitle,
    generatedAt,
    periodLabel: formatDateRangeLabel(dateFrom, dateTo),
    entryCountLabel,
    filterSummaryLines,
    columns,
    rows,
    footerCells,
  }
}

export function formatGatePassReportGeneratedAt(date: Date): string {
  return format(date, "do MMM yyyy, h:mm a")
}
