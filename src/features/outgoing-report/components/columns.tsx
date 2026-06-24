import type { AggregationFn, ColumnDef, SortingFn } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { DaybookLocation } from "@/features/daybook/types"
import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from "@/features/outgoing-report/api/types"
import {
  getOutgoingReportType,
  getOutgoingReportVariety,
} from "@/features/outgoing-report/utils/report-row-values"

const numberFormatter = new Intl.NumberFormat("en-IN")

export type OutgoingQuantityMode = "issued" | "available"

function parseReportNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (value == null || value === "") return null

  const parsed = Number(String(value).replaceAll(",", "").trim())

  return Number.isFinite(parsed) ? parsed : null
}

function parseReportDateValue(value: unknown): number | null {
  if (value == null || value === "") return null

  const parsed = new Date(String(value))
  const timestamp = parsed.getTime()

  return Number.isNaN(timestamp) ? null : timestamp
}

const reportNumericSortingFn: SortingFn<OutgoingGatePassReportRecord> = (
  rowA,
  rowB,
  columnId,
) => {
  const a = parseReportNumber(rowA.getValue(columnId))
  const b = parseReportNumber(rowB.getValue(columnId))

  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1

  return a === b ? 0 : a > b ? 1 : -1
}

const reportDateSortingFn: SortingFn<OutgoingGatePassReportRecord> = (
  rowA,
  rowB,
  columnId,
) => {
  const a = parseReportDateValue(rowA.getValue(columnId))
  const b = parseReportDateValue(rowB.getValue(columnId))

  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1

  return a === b ? 0 : a > b ? 1 : -1
}

export const outgoingReportSortingFns = {
  reportNumeric: reportNumericSortingFn,
  reportDate: reportDateSortingFn,
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

const formatQuantity = (quantity: number) => numberFormatter.format(quantity)
const sortText = { sortingFn: "text" as const, sortUndefined: "last" as const }
const sortNumeric = {
  sortingFn: reportNumericSortingFn,
  sortUndefined: "last" as const,
}
const sortDate = {
  sortingFn: reportDateSortingFn,
  sortUndefined: "last" as const,
}
const reportEmptyAggregation: AggregationFn<OutgoingGatePassReportRecord> =
  () => null
const reportSumAggregation: AggregationFn<OutgoingGatePassReportRecord> = (
  columnId,
  leafRows,
) =>
  leafRows.reduce((sum, row) => {
    const value = row.getValue(columnId)

    return (
      sum + (typeof value === "number" && Number.isFinite(value) ? value : 0)
    )
  }, 0)
const aggregateNone = { aggregationFn: reportEmptyAggregation }
const aggregateSum = { aggregationFn: reportSumAggregation }

const getOrderDetailQuantity = (
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
) =>
  quantityMode === "issued" ? detail.quantityIssued : detail.quantityAvailable

const formatLocation = (location?: DaybookLocation) =>
  location
    ? [location.chamber, location.floor, location.row].filter(Boolean).join("-")
    : null

const getOrderSizeQuantity = (
  row: OutgoingGatePassReportRecord,
  sizeName: string,
  quantityMode: OutgoingQuantityMode,
) =>
  row.orderDetails
    .filter((detail) => detail.size === sizeName)
    .reduce(
      (total, detail) => total + getOrderDetailQuantity(detail, quantityMode),
      0,
    )

const renderOrderDetailValue = (
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
) => {
  const location = formatLocation(detail.location)
  const quantity = getOrderDetailQuantity(detail, quantityMode)

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="font-semibold text-foreground">
        {formatQuantity(quantity)}
      </div>
      <div className="text-muted-foreground">{detail.size}</div>
      {location ? (
        <div className="text-muted-foreground">({location})</div>
      ) : null}
    </div>
  )
}

const baseColumns: ColumnDef<OutgoingGatePassReportRecord>[] = [
  {
    id: "name",
    accessorFn: (row) => row.farmerStorageLinkId.name,
    header: "Name",
    meta: { emphasize: true, filterLabel: "Farmer" },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: "address",
    accessorFn: (row) => row.farmerStorageLinkId.address ?? "-",
    header: "Address",
    meta: { filterLabel: "Farmer address", wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: "accountNumber",
    accessorFn: (row) => row.farmerStorageLinkId.accountNumber,
    header: "Account Number",
    meta: { filterLabel: "Account number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "gatePassNo",
    header: "Gate Pass No",
    meta: { filterLabel: "Gate pass number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue, row }) => {
      const value = getValue<number>()

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="tabular-nums">{String(value)}</span>
          {row.original.isNull ? (
            <Badge variant="secondary" className="text-xs">
              Nulled
            </Badge>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: "manualParchiNumber",
    header: "Manual Parchi No",
    meta: { filterLabel: "Manual parchi number", numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>()

      return value == null ? (
        "-"
      ) : (
        <span className="tabular-nums">{String(value)}</span>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      filterLabel: "Date",
      filterValueFormatter: (value) => formatDate(String(value ?? "")),
      mono: true,
    },
    ...sortDate,
    ...aggregateNone,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    id: "type",
    accessorFn: (row) => getOutgoingReportType(row),
    header: "Type",
    meta: { filterLabel: "Type" },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string>() || "-",
  },
  {
    id: "variety",
    accessorFn: (row) => getOutgoingReportVariety(row),
    header: "Variety",
    meta: { filterLabel: "Variety" },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string>() || "-",
  },
  {
    accessorKey: "from",
    header: "From",
    meta: { filterLabel: "From" },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || "-",
  },
  {
    accessorKey: "to",
    header: "To",
    meta: { filterLabel: "To" },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || "-",
  },
  {
    accessorKey: "truckNumber",
    header: "Truck No",
    meta: { filterLabel: "Truck number", mono: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || "-",
  },
]

const totalBagsColumn: ColumnDef<OutgoingGatePassReportRecord> = {
  accessorKey: "totalBags",
  header: () => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm leading-tight font-medium">Total</span>
      <span className="text-xs font-normal opacity-70">bags</span>
    </span>
  ),
  meta: {
    align: "right",
    filterLabel: "Total bags",
    groupStart: true,
    numeric: true,
  },
  ...sortNumeric,
  ...aggregateSum,
  cell: ({ getValue }) => {
    const value = getValue<number | undefined>()

    return value == null ? (
      "-"
    ) : (
      <span className="font-medium tabular-nums">{formatQuantity(value)}</span>
    )
  },
}

const trailingColumns: ColumnDef<OutgoingGatePassReportRecord>[] = [
  {
    id: "createdBy",
    accessorFn: (row) => row.createdBy?.name ?? "-",
    header: "Created By",
    meta: { filterLabel: "Created by" },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    meta: { filterLabel: "Remarks", wrap: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || "-",
  },
]

const columnCache = new Map<string, ColumnDef<OutgoingGatePassReportRecord>[]>()

export function collectOutgoingReportOrderSizeNames(
  rows: OutgoingGatePassReportRecord[],
): string[] {
  const sizes = new Set<string>()

  for (const row of rows) {
    for (const detail of row.orderDetails) {
      sizes.add(detail.size)
    }
  }

  return Array.from(sizes)
}

function getOutgoingReportColumnCacheKey(
  sizes: string[],
  quantityMode: OutgoingQuantityMode,
) {
  return `${sizes.join("\0")}|${quantityMode}`
}

function buildOutgoingReportColumns(
  sizes: string[],
  quantityMode: OutgoingQuantityMode,
): ColumnDef<OutgoingGatePassReportRecord>[] {
  const sizeColumns: ColumnDef<OutgoingGatePassReportRecord>[] = sizes.map(
    (sizeName) => ({
      id: `size-${sizeName}`,
      accessorFn: (row) => getOrderSizeQuantity(row, sizeName, quantityMode),
      header: sizeName,
      meta: {
        align: "right",
        filterLabel: sizeName,
        groupStart: true,
        numeric: true,
      },
      ...sortNumeric,
      ...aggregateSum,
      cell: ({ cell, getValue, row }) => {
        if (cell.getIsAggregated()) {
          return (
            <span className="tabular-nums">
              {formatQuantity(getValue<number>() ?? 0)}
            </span>
          )
        }

        const details = row.original.orderDetails.filter(
          (detail) => detail.size === sizeName,
        )

        if (!details.length) return "-"

        return (
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div
                key={`${detail.size}-${detail.location?.chamber ?? ""}-${detail.location?.floor ?? ""}-${detail.location?.row ?? ""}-${index}`}
              >
                {renderOrderDetailValue(detail, quantityMode)}
              </div>
            ))}
          </div>
        )
      },
    }),
  )

  return [
    ...baseColumns,
    totalBagsColumn,
    ...sizeColumns,
    ...trailingColumns,
  ]
}

export function getOutgoingReportColumns(
  rows: OutgoingGatePassReportRecord[],
  quantityMode: OutgoingQuantityMode = "issued",
): ColumnDef<OutgoingGatePassReportRecord>[] {
  const sizes = collectOutgoingReportOrderSizeNames(rows)
  const cacheKey = getOutgoingReportColumnCacheKey(sizes, quantityMode)
  const cached = columnCache.get(cacheKey)

  if (cached) return cached

  const columns = buildOutgoingReportColumns(sizes, quantityMode)
  columnCache.set(cacheKey, columns)

  return columns
}

export const columns: ColumnDef<OutgoingGatePassReportRecord>[] =
  getOutgoingReportColumns([])
