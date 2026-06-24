import { format, isValid, parse, parseISO } from "date-fns"
import type { Column, Row, Table } from "@tanstack/react-table"

import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from "@/features/outgoing-report/api/types"
import type { OutgoingQuantityMode } from "@/features/outgoing-report/components/columns"
import type {
  AdvancedFilterCondition,
  AdvancedReportGlobalFilter,
} from "@/features/outgoing-report/utils/report-filter-fns"

const INTEGER_COLUMNS = new Set<string>([
  "accountNumber",
  "gatePassNo",
  "manualParchiNumber",
  "totalBags",
])

const SUMMABLE_INTEGER_COLUMNS = new Set(["totalBags"])

const OPERATOR_LABELS: Record<string, string> = {
  contains: "contains",
  notContains: "does not contain",
  equals: "equals",
  notEquals: "does not equal",
  startsWith: "starts with",
  endsWith: "ends with",
  greaterThan: ">",
  greaterThanOrEqual: ">=",
  lessThan: "<",
  lessThanOrEqual: "<=",
  isEmpty: "is blank",
  isNotEmpty: "is not blank",
}

const indianIntegerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
})

export type ExportCellValue =
  | { kind: "text"; value: string }
  | { kind: "number"; value: number; format: "integer" }
  | { kind: "empty" }

function parseReportNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (value == null || value === "") return null

  const parsed = Number(String(value).replaceAll(",", "").trim())

  return Number.isFinite(parsed) ? parsed : null
}

function getOrderDetailQuantity(
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
) {
  return quantityMode === "issued"
    ? detail.quantityIssued
    : detail.quantityAvailable
}

function formatOrderDetailText(
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
): string {
  const location = detail.location
    ? [detail.location.chamber, detail.location.floor, detail.location.row]
        .filter(Boolean)
        .join("-")
    : null
  const quantity = getOrderDetailQuantity(detail, quantityMode)
  const parts = [`${quantity.toLocaleString("en-IN")} - ${detail.size}`]

  if (location) parts.push(`(${location})`)

  return parts.join(" ")
}

function sumOrderSizeQuantity(
  rows: readonly Row<OutgoingGatePassReportRecord>[],
  size: string,
  quantityMode: OutgoingQuantityMode,
) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.orderDetails
        .filter((detail) => detail.size === size)
        .reduce(
          (sum, detail) => sum + getOrderDetailQuantity(detail, quantityMode),
          0,
        )
    )
  }, 0)
}

export function getColumnExportLabel(
  column: Column<OutgoingGatePassReportRecord, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === "") return null

  const raw = String(value).trim()
  if (raw.length === 0) return null

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? parse(raw, "yyyy-MM-dd", new Date())
    : parseISO(raw)

  if (!isValid(parsed)) return raw

  return format(parsed, "do MMMM yyyy")
}

function formatDisplayValue(
  value: unknown,
  column: Column<OutgoingGatePassReportRecord, unknown>,
): string {
  const meta = column.columnDef.meta
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value)
  if (value == null || value === "") return "Blank"
  return String(value)
}

function formatSizeColumnValue(
  row: OutgoingGatePassReportRecord,
  columnId: string,
  quantityMode: OutgoingQuantityMode,
): ExportCellValue {
  const size = columnId.replace(/^size-/, "")
  const details = row.orderDetails.filter((detail) => detail.size === size)

  if (!details.length) return { kind: "empty" }

  if (details.length === 1) {
    return {
      kind: "number",
      value: getOrderDetailQuantity(details[0], quantityMode),
      format: "integer",
    }
  }

  return {
    kind: "text",
    value: details
      .map((detail) => formatOrderDetailText(detail, quantityMode))
      .join("\n"),
  }
}

export function formatExportCellValue(
  columnId: string,
  rawValue: unknown,
  row?: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = "issued",
): ExportCellValue {
  if (columnId.startsWith("size-")) {
    return row
      ? formatSizeColumnValue(row, columnId, quantityMode)
      : { kind: "empty" }
  }

  if (rawValue == null || rawValue === "") {
    return { kind: "empty" }
  }

  if (columnId === "date") {
    const formatted = formatReportDate(rawValue)
    return formatted ? { kind: "text", value: formatted } : { kind: "empty" }
  }

  if (INTEGER_COLUMNS.has(columnId)) {
    const parsed = parseReportNumber(rawValue)
    return parsed == null
      ? { kind: "empty" }
      : { kind: "number", value: parsed, format: "integer" }
  }

  return { kind: "text", value: String(rawValue) }
}

export function getExportCellForRow(
  row: Row<OutgoingGatePassReportRecord>,
  column: Column<OutgoingGatePassReportRecord, unknown>,
  quantityMode: OutgoingQuantityMode,
): ExportCellValue {
  const cell = row
    .getVisibleCells()
    .find((item) => item.column.id === column.id)

  if (!cell) return { kind: "empty" }

  const columnId = column.id
  const meta = column.columnDef.meta

  if (cell.getIsGrouped()) {
    const display = formatDisplayValue(cell.getValue(), column)
    const count = row.subRows.length.toLocaleString("en-IN")
    const indent = "  ".repeat(row.depth)
    return {
      kind: "text",
      value: `${indent}${display} (${count})`,
    }
  }

  if (cell.getIsAggregated()) {
    if (meta?.numeric !== true) return { kind: "empty" }
    return formatExportCellValue(
      columnId,
      cell.getValue(),
      row.original,
      quantityMode,
    )
  }

  if (cell.getIsPlaceholder()) {
    return { kind: "empty" }
  }

  if (row.getIsGrouped()) {
    return { kind: "empty" }
  }

  return formatExportCellValue(
    columnId,
    cell.getValue(),
    row.original,
    quantityMode,
  )
}

export function collectExportRows(
  table: Table<OutgoingGatePassReportRecord>,
): Row<OutgoingGatePassReportRecord>[] {
  const grouping = table.getState().grouping

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows
  }

  function flattenGroupedRows(
    rows: Row<OutgoingGatePassReportRecord>[],
  ): Row<OutgoingGatePassReportRecord>[] {
    const result: Row<OutgoingGatePassReportRecord>[] = []

    for (const row of rows) {
      result.push(row)
      if (row.subRows.length > 0) {
        result.push(...flattenGroupedRows(row.subRows))
      }
    }

    return result
  }

  return flattenGroupedRows(table.getGroupedRowModel().rows)
}

export function getFilteredLeafRowCount(
  table: Table<OutgoingGatePassReportRecord>,
): number {
  return table.getFilteredRowModel().flatRows.length
}

function formatConditionLabel(
  table: Table<OutgoingGatePassReportRecord>,
  condition: AdvancedFilterCondition,
): string {
  const column = table.getColumn(String(condition.columnId))
  const columnLabel = column
    ? getColumnExportLabel(column)
    : String(condition.columnId)
  const operatorLabel =
    OPERATOR_LABELS[condition.operator] ?? condition.operator

  if (condition.operator === "isEmpty" || condition.operator === "isNotEmpty") {
    return `${columnLabel} ${operatorLabel}`
  }

  const value = condition.value.trim()
  if (value.length === 0) return ""

  return `${columnLabel} ${operatorLabel} "${value}"`
}

function formatColumnFilterSummary(
  table: Table<OutgoingGatePassReportRecord>,
): string[] {
  const summaries: string[] = []

  for (const filter of table.getState().columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue

    const column = table.getColumn(filter.id)
    if (!column) continue

    const columnLabel = getColumnExportLabel(column)
    const formattedValues = filter.value.map((value) => {
      const meta = column.columnDef.meta
      if (meta?.filterValueFormatter) {
        return meta.filterValueFormatter(value)
      }
      if (value == null || value === "") return "Blank"
      return String(value)
    })

    summaries.push(`${columnLabel}: ${formattedValues.join(", ")}`)
  }

  return summaries
}

function formatAdvancedFilterSummary(
  table: Table<OutgoingGatePassReportRecord>,
  globalFilter: AdvancedReportGlobalFilter,
): string[] {
  const activeConditions = globalFilter.conditions
    .map((condition) => formatConditionLabel(table, condition))
    .filter((label) => label.length > 0)

  if (activeConditions.length === 0) return []

  return [
    `Advanced (${globalFilter.logic}): ${activeConditions.join(
      globalFilter.logic === "AND" ? " · " : " | ",
    )}`,
  ]
}

function formatGroupingSummary(
  table: Table<OutgoingGatePassReportRecord>,
): string | null {
  const grouping = table.getState().grouping
  if (grouping.length === 0) return null

  const labels = grouping
    .map((columnId) => {
      const column = table.getColumn(columnId)
      return column ? getColumnExportLabel(column) : columnId
    })
    .join(" → ")

  return `Grouped by: ${labels}`
}

function formatSortingSummary(
  table: Table<OutgoingGatePassReportRecord>,
): string | null {
  const sorting = table.getState().sorting
  if (sorting.length === 0) return null

  const labels = sorting
    .map((sort) => {
      const column = table.getColumn(sort.id)
      const columnLabel = column ? getColumnExportLabel(column) : sort.id
      return `${columnLabel} (${sort.desc ? "desc" : "asc"})`
    })
    .join(", ")

  return `Sorted by: ${labels}`
}

export function buildFilterSummaryLines(
  table: Table<OutgoingGatePassReportRecord>,
  quantityMode: OutgoingQuantityMode,
): string[] {
  const globalFilter = table.getState().globalFilter

  const lines = [
    `Quantity view: ${quantityMode === "issued" ? "Issued Qty" : "Available Qty"}`,
    ...formatColumnFilterSummary(table),
    ...(typeof globalFilter === "object" &&
    globalFilter != null &&
    "conditions" in globalFilter
      ? formatAdvancedFilterSummary(
          table,
          globalFilter as AdvancedReportGlobalFilter,
        )
      : []),
  ]

  const groupingSummary = formatGroupingSummary(table)
  if (groupingSummary) lines.push(groupingSummary)

  const sortingSummary = formatSortingSummary(table)
  if (sortingSummary) lines.push(sortingSummary)

  return lines
}

export function exportCellValueToPrimitive(
  cell: ExportCellValue,
): string | number {
  if (cell.kind === "empty") return ""
  if (cell.kind === "number") return cell.value
  return cell.value
}

export function exportCellValueToDisplay(cell: ExportCellValue): string {
  if (cell.kind === "empty") return "—"
  if (cell.kind === "number") {
    return indianIntegerFormatter.format(cell.value)
  }
  return cell.value
}

export function isSummableExportColumn(columnId: string): boolean {
  return SUMMABLE_INTEGER_COLUMNS.has(columnId) || columnId.startsWith("size-")
}

export function getFooterExportValue(
  columnId: string,
  rows: readonly Row<OutgoingGatePassReportRecord>[],
  quantityMode: OutgoingQuantityMode,
): ExportCellValue {
  if (columnId === "totalBags") {
    const total = rows.reduce(
      (sum, row) =>
        sum +
        (typeof row.original.totalBags === "number" ? row.original.totalBags : 0),
      0,
    )

    return { kind: "number", value: total, format: "integer" }
  }

  if (columnId.startsWith("size-")) {
    const total = sumOrderSizeQuantity(
      rows,
      columnId.replace(/^size-/, ""),
      quantityMode,
    )

    return { kind: "number", value: total, format: "integer" }
  }

  return { kind: "empty" }
}

export function getExcelNumFmt(): string {
  return "#,##,##0"
}

export function formatDateRangeLabel(
  dateFrom?: string,
  dateTo?: string,
): string {
  const fromDate = dateFrom ? parse(dateFrom, "yyyy-MM-dd", new Date()) : undefined
  const toDate = dateTo ? parse(dateTo, "yyyy-MM-dd", new Date()) : undefined

  if (fromDate && isValid(fromDate) && toDate && isValid(toDate)) {
    return `${format(fromDate, "do MMM yyyy")} – ${format(toDate, "do MMM yyyy")}`
  }
  if (fromDate && isValid(fromDate)) {
    return `From ${format(fromDate, "do MMM yyyy")}`
  }
  if (toDate && isValid(toDate)) {
    return `Until ${format(toDate, "do MMM yyyy")}`
  }
  return "All dates"
}
