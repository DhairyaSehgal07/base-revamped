import type { GroupingState, SortingState } from "@tanstack/react-table"

import type { CommodityPreference } from "@/features/auth/types"
import type { DaybookEntry } from "@/features/daybook/types"
import { isIncomingDaybookEntry } from "@/features/daybook/types"
import { formatDaybookDate, formatQuantity } from "@/features/daybook/utils/format"
import type { FarmerGatePassSummaries } from "@/features/people/api/use-farmer-gate-passes"
import type { PersonDetailSearch } from "@/features/people/search"
import { personDetailSearchToFarmerDisplay } from "@/features/people/utils/person-detail-search"
import {
  buildFarmerStockSummary,
  type StockSummaryMatrix,
} from "@/features/people/utils/build-farmer-stock-summary"
import type { FarmerReportSections } from "@/features/people-report/utils/build-farmer-report-sections"
import { splitFarmerReportEntries } from "@/features/people-report/utils/build-farmer-report-sections"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import { buildPdfGroupedLedgerItems } from "@/features/people-report/utils/build-farmer-report-pdf-grouped-ledger"
import { getFarmerReportColumnsForSizes } from "@/features/people-report/components/columns"
import { FARMER_REPORT_DEFAULT_SORTING } from "@/features/people-report/components/data-table"
import {
  collectUniqueBagSizes,
  getGatePassSizeQuantityLines,
  getGatePassVariety,
  orderBagSizes,
  sumSizeColumn,
} from "@/features/people-report/utils/gate-pass-table-helpers"

export type PdfLedgerSizeValue =
  | { type: "stacked"; main: string; sub: string }
  | { type: "plain"; value: string }

export type PdfLedgerRow = {
  date: string
  gatePass: string
  variety: string
  stockFilter: string
  customMarka: string
  sizes: Record<string, PdfLedgerSizeValue | null>
  total: string
  remarks: string
  isOpeningBalance?: boolean
}

export type PdfLedgerGroupRow = {
  kind: "group"
  columnId: "variety" | "stockFilter"
  label: string
  depth: number
  childCount: number
  sizes: Record<string, number>
  rowBagsTotal: number
}

export type PdfLedgerLeafRow = PdfLedgerRow & {
  kind: "leaf"
  depth: number
  suppressedGroupColumns: ("variety" | "stockFilter")[]
}

export type PdfLedgerItem = PdfLedgerGroupRow | PdfLedgerLeafRow

export type FarmerStockLedgerPdfData = {
  farmer: {
    name: string
    address: string
    mobileNumber: string
    accountNumber?: number
  }
  stats: {
    incomingGatePassCount: number
    incomingBags: number
    incomingInternalBags: number
    outgoingGatePassCount: number
    outgoingBags: number
    outgoingInternalBags: number
  }
  showStockFilter: boolean
  showCustomMarka: boolean
  stockSummary: StockSummaryMatrix
  sizeColumns: string[]
  incomingLedger: PdfLedgerItem[]
  outgoingLedger: PdfLedgerItem[]
  incomingFooterSizes: Record<string, number>
  outgoingFooterSizes: Record<string, number>
  incomingClosingBalance: number
  outgoingClosingBalance: number
  generatedAt: string
}

function computeIncomingFooterSizes(
  rows: FarmerReportTableRow[],
  sizeColumns: string[],
): Record<string, number> {
  const gatePassRows = rows.filter((row) => row.kind === "gate-pass" && row.entry)

  return Object.fromEntries(
    sizeColumns.map((size) => [
      size,
      sumSizeColumn(
        gatePassRows.map((row) => row.entry!),
        size,
      ),
    ]),
  )
}

function computeOutgoingFooterSizes(
  rows: FarmerReportTableRow[],
  sizeColumns: string[],
): Record<string, number> {
  const openingRow = rows.find((row) => row.kind === "opening-balance")
  const gatePassRows = rows.filter((row) => row.kind === "gate-pass" && row.entry)

  return Object.fromEntries(
    sizeColumns.map((size) => {
      const openingTotal = openingRow?.sizeTotals?.[size] ?? 0
      const outgoingTotal = sumSizeColumn(
        gatePassRows.map((row) => row.entry!),
        size,
      )

      return [size, openingTotal - outgoingTotal]
    }),
  )
}

export type BuildFarmerStockLedgerPdfDataInput = {
  entries: DaybookEntry[]
  sections: FarmerReportSections
  summaries: FarmerGatePassSummaries
  commodities: CommodityPreference[]
  search: PersonDetailSearch
  showStockFilter?: boolean
  showCustomMarka?: boolean
  grouping?: GroupingState
  sorting?: SortingState
  incomingSorting?: SortingState
  outgoingSorting?: SortingState
  generatedAt?: Date
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function mapSizeValueForEntry(
  row: FarmerReportTableRow,
  size: string,
): PdfLedgerSizeValue | null {
  if (row.kind === "opening-balance") {
    const total = row.sizeTotals?.[size]
    if (total === undefined || total <= 0) return null
    return { type: "plain", value: formatQuantity(total) }
  }

  if (!row.entry) return null

  const lines = getGatePassSizeQuantityLines(row.entry, size)
  if (lines.length === 0) return null

  if (lines.length === 1) {
    const line = lines[0]!
    if (line.locationLabel) {
      return {
        type: "stacked",
        main: formatQuantity(line.quantity),
        sub: `(${line.locationLabel})`,
      }
    }

    return { type: "plain", value: formatQuantity(line.quantity) }
  }

  const total = lines.reduce((sum, line) => sum + line.quantity, 0)
  const locations = lines
    .map((line) => `${formatQuantity(line.quantity)} (${line.locationLabel})`)
    .join(", ")

  return {
    type: "stacked",
    main: formatQuantity(total),
    sub: `(${locations})`,
  }
}

function getRowStockFilter(row: FarmerReportTableRow): string {
  if (row.kind === "opening-balance" || !row.entry) return "—"
  if (!isIncomingDaybookEntry(row.entry)) return "—"
  return row.entry.stockFilter?.trim() || "—"
}

function getRowCustomMarka(row: FarmerReportTableRow): string {
  if (row.kind === "opening-balance" || !row.entry) return "—"
  if (!isIncomingDaybookEntry(row.entry)) return "—"
  return row.entry.customMarka?.trim() || "—"
}

export function mapFarmerReportRowToPdfLedger(
  row: FarmerReportTableRow,
  sizeColumns: string[],
): PdfLedgerRow {
  const sizes = Object.fromEntries(
    sizeColumns.map((size) => [size, mapSizeValueForEntry(row, size)]),
  ) as Record<string, PdfLedgerSizeValue | null>

  if (row.kind === "opening-balance") {
    return {
      date: "Opening Balance",
      gatePass: "—",
      variety: "—",
      stockFilter: "—",
      customMarka: "—",
      sizes,
      total: formatQuantity(row.runningTotal),
      remarks: "—",
      isOpeningBalance: true,
    }
  }

  const entry = row.entry!
  return {
    date: formatDaybookDate(entry.date || entry.createdAt),
    gatePass: `#${entry.gatePassNo}`,
    variety: getGatePassVariety(entry),
    stockFilter: getRowStockFilter(row),
    customMarka: getRowCustomMarka(row),
    sizes,
    total: formatQuantity(row.runningTotal),
    remarks: entry.remarks?.trim() || "—",
  }
}

export function buildFarmerStockLedgerPdfData({
  entries,
  sections,
  summaries,
  commodities,
  search,
  showStockFilter = false,
  showCustomMarka = false,
  grouping = [],
  sorting = FARMER_REPORT_DEFAULT_SORTING,
  incomingSorting,
  outgoingSorting,
  generatedAt = new Date(),
}: BuildFarmerStockLedgerPdfDataInput): FarmerStockLedgerPdfData {
  const incomingPasses = entries.filter(isIncomingDaybookEntry)
  const stockSummary = buildFarmerStockSummary({
    passes: incomingPasses,
    commodities,
    stockFilterTab: "all",
    quantityMode: "current",
  })

  const sizeColumns = orderBagSizes(
    collectUniqueBagSizes(entries),
    commodities,
  )

  const columns = getFarmerReportColumnsForSizes(
    sizeColumns,
    showCustomMarka,
    showStockFilter,
  )

  const resolvedIncomingSorting = incomingSorting ?? sorting
  const resolvedOutgoingSorting = outgoingSorting ?? sorting

  const incomingResult = buildPdfGroupedLedgerItems({
    rows: sections.incoming,
    columns,
    grouping,
    sorting: resolvedIncomingSorting,
    sizeColumns,
  })

  const outgoingResult = buildPdfGroupedLedgerItems({
    rows: sections.outgoing,
    columns,
    grouping,
    sorting: resolvedOutgoingSorting,
    sizeColumns,
  })

  const { incoming, outgoing } = splitFarmerReportEntries(entries)

  const incomingClosingBalance =
    sections.incoming.length > 0
      ? sections.incoming[sections.incoming.length - 1]!.runningTotal
      : 0

  const outgoingClosingBalance =
    sections.outgoing.length > 0
      ? sections.outgoing[sections.outgoing.length - 1]!.runningTotal
      : 0

  return {
    farmer: personDetailSearchToFarmerDisplay(search),
    stats: {
      incomingGatePassCount: incoming.length,
      incomingBags: summaries.totalIncomingBags,
      incomingInternalBags: summaries.totalInternallyTransferredIncomingBags,
      outgoingGatePassCount: outgoing.length,
      outgoingBags: summaries.totalOutgoingBags,
      outgoingInternalBags: summaries.totalInternallyTransferredOutgoingBags,
    },
    showStockFilter,
    showCustomMarka,
    stockSummary,
    sizeColumns,
    incomingLedger: incomingResult.items,
    outgoingLedger: [
      ...outgoingResult.openingBalanceRows,
      ...outgoingResult.items,
    ],
    incomingFooterSizes: computeIncomingFooterSizes(
      sections.incoming,
      sizeColumns,
    ),
    outgoingFooterSizes: computeOutgoingFooterSizes(
      sections.outgoing,
      sizeColumns,
    ),
    incomingClosingBalance,
    outgoingClosingBalance,
    generatedAt: formatGeneratedAt(generatedAt),
  }
}
