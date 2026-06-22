/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table"

import type { CommodityPreference } from "@/features/auth/types"
import type { DaybookEntry } from "@/features/daybook/types"
import { isIncomingDaybookEntry } from "@/features/daybook/types"
import { formatDaybookDate, formatQuantity } from "@/features/daybook/utils/format"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import {
  collectUniqueBagSizes,
  getGatePassSizeQuantityLines,
  getGatePassVariety,
  orderBagSizes,
} from "@/features/people-report/utils/gate-pass-table-helpers"

function RunningTotalCell({ value }: { value: number }) {
  return <span className="tabular-nums">{formatQuantity(value)}</span>
}

function SizeQuantityCell({
  row,
  size,
}: {
  row: FarmerReportTableRow
  size: string
}) {
  if (row.kind === "opening-balance") {
    const total = row.sizeTotals?.[size]
    if (total === undefined || total <= 0) {
      return <span className="text-muted-foreground">—</span>
    }

    return <span className="tabular-nums">{formatQuantity(total)}</span>
  }

  if (!row.entry) {
    return <span className="text-muted-foreground">—</span>
  }

  const lines = getGatePassSizeQuantityLines(row.entry, size)

  if (lines.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {lines.map((line, index) => (
        <div key={`${line.locationLabel}-${index}`} className="flex flex-col items-end gap-0.5">
          <span className="tabular-nums">{formatQuantity(line.quantity)}</span>
          <span className="text-xs text-muted-foreground">({line.locationLabel})</span>
        </div>
      ))}
    </div>
  )
}

function isOpeningBalanceRow(row: FarmerReportTableRow): boolean {
  return row.kind === "opening-balance"
}

export function getFarmerReportColumns(
  rows: DaybookEntry[],
  commodities: CommodityPreference[] = [],
  showCustomMarka = false,
): ColumnDef<FarmerReportTableRow>[] {
  const orderedSizes = orderBagSizes(collectUniqueBagSizes(rows), commodities)

  const staticColumns: ColumnDef<FarmerReportTableRow>[] = [
    {
      id: "date",
      accessorFn: (row) => row.entry?.date || row.entry?.createdAt || "",
      header: "Date",
      enableSorting: false,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original)) {
          return (
            <span className="font-semibold text-foreground">Closing Stock</span>
          )
        }

        if (!row.original.entry) {
          return <span className="text-muted-foreground">—</span>
        }

        return formatDaybookDate(
          row.original.entry.date || row.original.entry.createdAt,
        )
      },
    },
    {
      id: "gatePassNo",
      accessorFn: (row) => row.entry?.gatePassNo ?? null,
      header: "Gate Pass No",
      meta: { mono: true, numeric: true },
      enableSorting: false,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>
        }

        return (
          <span className="font-mono tabular-nums">#{row.original.entry.gatePassNo}</span>
        )
      },
    },
    {
      id: "variety",
      accessorFn: (row) =>
        row.entry ? getGatePassVariety(row.entry) : "—",
      header: "Variety",
      meta: { compact: true },
      enableSorting: false,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>
        }

        const variety = getGatePassVariety(row.original.entry)
        return (
          <span className="block truncate" title={variety}>
            {variety}
          </span>
        )
      },
    },
  ]

  if (showCustomMarka) {
    staticColumns.push({
      id: "customMarka",
      accessorFn: (row) =>
        row.entry && isIncomingDaybookEntry(row.entry)
          ? row.entry.customMarka?.trim() || "—"
          : "—",
      header: "Custom Marka",
      meta: { compact: true },
      enableSorting: false,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original) || !row.original.entry) {
          return <span className="text-muted-foreground">—</span>
        }

        const marka = isIncomingDaybookEntry(row.original.entry)
          ? row.original.entry.customMarka?.trim() || "—"
          : "—"

        return (
          <span className="block truncate" title={marka}>
            {marka}
          </span>
        )
      },
    })
  }

  const sizeColumns: ColumnDef<FarmerReportTableRow>[] = orderedSizes.map(
    (size, index) => ({
      id: `size-${size}`,
      accessorFn: (row) => row,
      header: size,
      meta: {
        align: "right",
        numeric: true,
        groupStart: index === 0,
      },
      enableSorting: false,
      cell: ({ row }) => (
        <SizeQuantityCell row={row.original} size={size} />
      ),
    }),
  )

  const trailingColumns: ColumnDef<FarmerReportTableRow>[] = [
    {
      id: "totalBags",
      accessorFn: (row) => row.runningTotal,
      header: "Total Bags",
      meta: { align: "right", numeric: true },
      enableSorting: false,
      cell: ({ row }) => (
        <RunningTotalCell value={row.original.runningTotal} />
      ),
    },
    {
      id: "remarks",
      accessorFn: (row) => row.entry?.remarks?.trim() || "—",
      header: "Remarks",
      meta: { wrap: true },
      enableSorting: false,
      cell: ({ row }) => {
        if (isOpeningBalanceRow(row.original)) {
          return <span className="text-muted-foreground">—</span>
        }

        const remarks = row.original.entry?.remarks?.trim() || "—"
        return (
          <span className="text-muted-foreground" title={remarks}>
            {remarks}
          </span>
        )
      },
    },
  ]

  return [...staticColumns, ...sizeColumns, ...trailingColumns]
}
