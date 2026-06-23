import type ExcelJS from "exceljs"

import type {
  FarmerStockLedgerPdfData,
  PdfLedgerItem,
  PdfLedgerLeafRow,
  PdfLedgerSizeValue,
} from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"
import type { StockSummaryMatrix } from "@/features/people/utils/build-farmer-stock-summary"
import type { ExcelPreviewRow, ExcelPreviewStockSummary } from "@/lib/excel-preview-tab"
import {
  EXCEL_DATA_ROW_HEIGHT,
  EXCEL_HEADER_ROW_HEIGHT,
  EXCEL_SUBTITLE_ROW_HEIGHT,
  EXCEL_TITLE_ROW_HEIGHT,
  applyExcelRowHeight,
  configureWorksheetForMicrosoftExcel,
} from "@/lib/excel-worksheet-compat"
import { loadExcelJS } from "@/lib/load-exceljs"

const COLORS = {
  titleBg: "FFFFFFFF",
  titleFg: "FF1A4731",
  subtitleBg: "FFFFFFFF",
  subtitleFg: "FF1F2937",
  dateBg: "FFFFFFFF",
  dateFg: "FF6B7280",
  headerBg: "FF2D7A50",
  headerFg: "FFFFFFFF",
  rowEven: "FFEFF8F3",
  rowOdd: "FFFFFFFF",
  totalRowBg: "FFDCEFE4",
  totalRowFg: "FF1A4731",
  borderColor: "FFB8DEC9",
  sectionBg: "FFEFF8F3",
  sectionFg: "FF1A4731",
  bodyFg: "FF1F2937",
} as const

const FONTS = {
  title: { name: "Calibri", size: 20, bold: true },
  subtitle: { name: "Calibri", size: 13, bold: false },
  date: { name: "Calibri", size: 10, bold: false, italic: true },
  colHeader: { name: "Calibri", size: 10, bold: true },
  body: { name: "Calibri", size: 10, bold: false },
  section: { name: "Calibri", size: 10, bold: true },
} as const

const THIN_BORDER = {
  style: "thin" as ExcelJS.BorderStyle,
  color: { argb: COLORS.borderColor },
}

const CELL_BORDER: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
}

const FILLS = {
  rowEven: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.rowEven },
  } satisfies ExcelJS.Fill,
  rowOdd: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.rowOdd },
  } satisfies ExcelJS.Fill,
  section: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.sectionBg },
  } satisfies ExcelJS.Fill,
  header: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.headerBg },
  } satisfies ExcelJS.Fill,
  total: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.totalRowBg },
  } satisfies ExcelJS.Fill,
}

const ALIGN_LEFT = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
} satisfies Partial<ExcelJS.Alignment>

const ALIGN_RIGHT = {
  horizontal: "right",
  vertical: "middle",
} satisfies Partial<ExcelJS.Alignment>

const FONT_BODY = {
  ...FONTS.body,
  color: { argb: COLORS.bodyFg },
} satisfies Partial<ExcelJS.Font>

const FONT_BODY_BOLD = {
  ...FONTS.body,
  bold: true,
  color: { argb: COLORS.bodyFg },
} satisfies Partial<ExcelJS.Font>

const FONT_SECTION = {
  ...FONTS.section,
  color: { argb: COLORS.sectionFg },
} satisfies Partial<ExcelJS.Font>

const FONT_HEADER = {
  ...FONTS.colHeader,
  color: { argb: COLORS.headerFg },
} satisfies Partial<ExcelJS.Font>

const FONT_TOTAL = {
  ...FONTS.body,
  bold: true,
  color: { argb: COLORS.totalRowFg },
} satisfies Partial<ExcelJS.Font>

const SMART_NUMBER_FORMAT = "#,##0.##"

export type LedgerColumnLayout = {
  headers: string[]
  leadingColumnCount: number
  sizeColumnStartIndex: number
  totalColumnIndex: number
  remarksColumnIndex: number
}

export type ExcelBodyRow = {
  values: Array<string | number>
  boldByColumn: boolean[]
  isGroupedOrAggregatedRow: boolean
  isSectionTitle?: boolean
  isTotalsRow?: boolean
}

class ColumnWidthTracker {
  private readonly widths: number[]

  constructor(headers: string[]) {
    this.widths = headers.map((header) => {
      const longestHeaderWord = header
        .split(/\s+/)
        .reduce((max, word) => Math.max(max, word.length), 0)
      return Math.max(10, longestHeaderWord + 2)
    })
  }

  observeRow(values: Array<string | number>) {
    for (let index = 0; index < values.length; index++) {
      const cell = values[index]
      if (cell === "" || cell == null) continue

      const length =
        typeof cell === "number"
          ? cell.toLocaleString("en-IN").length
          : String(cell).length

      if (length > this.widths[index] - 2) {
        this.widths[index] = Math.min(40, length + 2)
      }
    }
  }

  finalize(): number[] {
    return this.widths
  }
}

export function getLedgerColumnLayout(
  sizeColumns: string[],
  showStockFilter: boolean,
  showCustomMarka: boolean,
): LedgerColumnLayout {
  const headers = ["Date", "Gate Pass No", "Variety"]

  if (showStockFilter) headers.push("Filter")
  if (showCustomMarka) headers.push("Marka")

  const sizeColumnStartIndex = headers.length
  headers.push(...sizeColumns, "Total Bags", "Remarks")

  const totalColumnIndex = sizeColumnStartIndex + sizeColumns.length
  const remarksColumnIndex = totalColumnIndex + 1

  return {
    headers,
    leadingColumnCount: sizeColumnStartIndex,
    sizeColumnStartIndex,
    totalColumnIndex,
    remarksColumnIndex,
  }
}

function getDayOrdinal(day: number): string {
  const mod10 = day % 10
  const mod100 = day % 100
  if (mod10 === 1 && mod100 !== 11) return `${day}st`
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`
  return `${day}th`
}

export function getExportDateLabel(date: Date): string {
  const day = getDayOrdinal(date.getDate())
  const month = date.toLocaleString("en-IN", { month: "long" })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function formatPdfSizeValue(value: PdfLedgerSizeValue | null | undefined): string {
  if (!value) return "—"
  if (value.type === "stacked") return `${value.main} ${value.sub}`
  return value.value
}

function parseLocaleNumber(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "—") return null

  const normalized = trimmed.replace(/,/g, "")
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null

  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? null : parsed
}

function coerceToNumber(value: string | number): string | number {
  if (typeof value === "number") return value

  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "—") return value

  const parsed = parseLocaleNumber(trimmed)
  if (parsed !== null) return parsed

  return value
}

function applyFill(cell: ExcelJS.Cell, fill: ExcelJS.Fill) {
  cell.fill = fill
}

function createSectionTitleRow(title: string, columnCount: number): ExcelBodyRow {
  return {
    values: [title, ...Array(columnCount - 1).fill("")],
    boldByColumn: Array(columnCount).fill(true),
    isGroupedOrAggregatedRow: true,
    isSectionTitle: true,
  }
}

function createTotalsRowValues(
  layout: LedgerColumnLayout,
  footerLabel: string,
  footerSizeTotals: Record<string, number>,
  closingBalance: number,
): Array<string | number> {
  const values: Array<string | number> = Array(layout.headers.length).fill("")

  values[0] = footerLabel

  layout.headers.forEach((header, index) => {
    if (index < layout.sizeColumnStartIndex || index >= layout.totalColumnIndex) {
      return
    }
    const value = footerSizeTotals[header] ?? 0
    values[index] = value !== 0 ? value : "—"
  })

  values[layout.totalColumnIndex] = closingBalance
  return values
}

function createTotalsBodyRow(values: Array<string | number>): ExcelBodyRow {
  return {
    values,
    boldByColumn: values.map((value, index) => index === 0 || typeof value === "number"),
    isGroupedOrAggregatedRow: true,
    isTotalsRow: true,
  }
}

export function ledgerItemsToBodyRows(
  items: PdfLedgerItem[],
  layout: LedgerColumnLayout,
  showStockFilter: boolean,
  showCustomMarka: boolean,
): ExcelBodyRow[] {
  const sizeHeaders = layout.headers.slice(
    layout.sizeColumnStartIndex,
    layout.totalColumnIndex,
  )

  return items.map((item) => {
    if (item.kind === "group") {
      const values: Array<string | number> = Array(layout.headers.length).fill("")
      const boldByColumn = Array(layout.headers.length).fill(false)

      values[0] = `${"  ".repeat(item.depth)}${item.label} (${item.childCount})`
      boldByColumn[0] = true

      layout.headers.forEach((header, index) => {
        if (index < layout.sizeColumnStartIndex || index > layout.totalColumnIndex) {
          return
        }
        if (index === layout.totalColumnIndex) {
          values[index] = item.rowBagsTotal > 0 ? item.rowBagsTotal : "—"
          boldByColumn[index] = true
          return
        }
        const sizeValue = item.sizes[header] ?? 0
        values[index] = sizeValue > 0 ? sizeValue : "—"
        boldByColumn[index] = true
      })

      return {
        values,
        boldByColumn,
        isGroupedOrAggregatedRow: true,
      }
    }

    const leaf = item as PdfLedgerLeafRow
    const values: Array<string | number> = []
    const boldByColumn: boolean[] = []

    const pushCell = (value: string | number, bold = false) => {
      values.push(coerceToNumber(value))
      boldByColumn.push(bold)
    }

    pushCell(`${"  ".repeat(leaf.depth)}${leaf.date}`, leaf.isOpeningBalance)
    pushCell(leaf.gatePass)
    pushCell(leaf.suppressedGroupColumns.includes("variety") ? "" : leaf.variety, true)

    if (showStockFilter) {
      pushCell(
        leaf.suppressedGroupColumns.includes("stockFilter") ? "" : leaf.stockFilter,
      )
    }

    if (showCustomMarka) {
      pushCell(leaf.customMarka)
    }

    for (const size of sizeHeaders) {
      pushCell(formatPdfSizeValue(leaf.sizes[size]))
    }

    pushCell(leaf.total, true)
    pushCell(leaf.remarks)

    return {
      values,
      boldByColumn,
      isGroupedOrAggregatedRow: false,
    }
  })
}

function addMergedHeaderRow(
  worksheet: ExcelJS.Worksheet,
  rowIndex: number,
  columnCount: number,
  value: string,
  options: {
    height: number
    font: Partial<ExcelJS.Font>
    fillArgb: string
    alignment?: Partial<ExcelJS.Alignment>
  },
) {
  const row = worksheet.getRow(rowIndex)
  row.height = options.height
  worksheet.mergeCells(rowIndex, 1, rowIndex, columnCount)
  const cell = row.getCell(1)
  cell.value = value
  cell.font = options.font as ExcelJS.Font
  applyFill(cell, {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: options.fillArgb },
  })
  cell.alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
    ...options.alignment,
  }
}

function styleHeaderCells(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    applyFill(cell, FILLS.header)
    cell.border = CELL_BORDER
    cell.font = FONT_HEADER
    cell.alignment = ALIGN_LEFT
  })
}

function styleBodyRow(
  excelRow: ExcelJS.Row,
  dataRow: ExcelBodyRow,
  columnCount: number,
) {
  excelRow.height = EXCEL_DATA_ROW_HEIGHT

  const rowFill = dataRow.isSectionTitle
    ? FILLS.section
    : dataRow.isGroupedOrAggregatedRow
      ? FILLS.rowEven
      : FILLS.rowOdd

  for (let columnNumber = 1; columnNumber <= columnCount; columnNumber++) {
    const cell = excelRow.getCell(columnNumber)
    applyFill(cell, rowFill)
    cell.border = CELL_BORDER

    const isBold =
      dataRow.isSectionTitle || dataRow.boldByColumn[columnNumber - 1] === true
    cell.font = dataRow.isSectionTitle
      ? FONT_SECTION
      : isBold
        ? FONT_BODY_BOLD
        : FONT_BODY
    cell.alignment = ALIGN_LEFT

    const cellValue = dataRow.values[columnNumber - 1]
    if (typeof cellValue === "number") {
      cell.alignment = ALIGN_RIGHT
      cell.numFmt = SMART_NUMBER_FORMAT
    }
  }
}

function addStyledBodyRows(
  worksheet: ExcelJS.Worksheet,
  dataRows: ExcelBodyRow[],
  columnCount: number,
  widthTracker: ColumnWidthTracker,
  previewRows: ExcelPreviewRow[],
) {
  if (dataRows.length === 0) return

  const excelRows = worksheet.addRows(dataRows.map((row) => row.values))

  for (let index = 0; index < dataRows.length; index++) {
    const dataRow = dataRows[index]
    widthTracker.observeRow(dataRow.values)
    styleBodyRow(excelRows[index], dataRow, columnCount)
    previewRows.push(dataRow)
  }
}

function addBodyRow(
  worksheet: ExcelJS.Worksheet,
  dataRow: ExcelBodyRow,
  columnCount: number,
  widthTracker: ColumnWidthTracker,
) {
  const excelRow = worksheet.addRow(dataRow.values)
  widthTracker.observeRow(dataRow.values)
  styleBodyRow(excelRow, dataRow, columnCount)
}

function addColumnHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]) {
  const row = worksheet.addRow(headers)
  applyExcelRowHeight(row, EXCEL_HEADER_ROW_HEIGHT)
  styleHeaderCells(row)
  return row
}

function addTotalsRow(
  worksheet: ExcelJS.Worksheet,
  values: Array<string | number>,
  columnCount: number,
) {
  const exRow = worksheet.addRow(values)
  applyExcelRowHeight(exRow, EXCEL_DATA_ROW_HEIGHT)

  for (let colNumber = 1; colNumber <= columnCount; colNumber++) {
    const rawVal = values[colNumber - 1]
    const cell = exRow.getCell(colNumber)
    applyFill(cell, FILLS.total)
    cell.border = CELL_BORDER
    cell.font = FONT_TOTAL
    const isNumeric = typeof rawVal === "number"
    cell.alignment = isNumeric ? ALIGN_RIGHT : ALIGN_LEFT
    if (isNumeric) {
      cell.numFmt = SMART_NUMBER_FORMAT
    }
  }
}

function addStockSummaryRows(
  worksheet: ExcelJS.Worksheet,
  matrix: StockSummaryMatrix,
  sizeColumns: string[],
  columnCount: number,
  widthTracker: ColumnWidthTracker,
): ExcelPreviewStockSummary {
  const summaryTitle = createSectionTitleRow("Stock Summary", columnCount)
  addBodyRow(worksheet, summaryTitle, columnCount, widthTracker)

  const summaryHeaders = ["Varieties", ...sizeColumns, "Total"]
  const previewDataRows: Array<Array<string | number>> = []

  const paddedHeaders = [
    ...summaryHeaders,
    ...Array(Math.max(0, columnCount - summaryHeaders.length)).fill(""),
  ].slice(0, columnCount)

  const headerRow = worksheet.addRow(paddedHeaders)
  applyExcelRowHeight(headerRow, EXCEL_HEADER_ROW_HEIGHT)
  styleHeaderCells(headerRow)

  for (const summaryRow of matrix.rows) {
    const values: Array<string | number> = [summaryRow.variety]

    for (const size of sizeColumns) {
      values.push(summaryRow.bySize[size] ?? 0)
    }

    values.push(summaryRow.total)
    previewDataRows.push([...values])

    while (values.length < columnCount) {
      values.push("")
    }

    const row: ExcelBodyRow = {
      values: values.slice(0, columnCount),
      boldByColumn: Array.from({ length: columnCount }, (_, index) =>
        index === summaryHeaders.length - 1,
      ),
      isGroupedOrAggregatedRow: false,
    }
    addBodyRow(worksheet, row, columnCount, widthTracker)
  }

  const footerValues: Array<string | number> = ["Bag Total"]
  for (const size of sizeColumns) {
    footerValues.push(matrix.footerBySize[size] ?? 0)
  }
  footerValues.push(matrix.grandTotal)

  const footerPreview = [...footerValues]
  while (footerValues.length < columnCount) {
    footerValues.push("")
  }

  addTotalsRow(worksheet, footerValues.slice(0, columnCount), columnCount)
  worksheet.addRow([])

  return {
    headers: summaryHeaders,
    rows: previewDataRows,
    footer: footerPreview,
  }
}

export type BuildFarmerStockLedgerExcelPackageInput = {
  reportData: FarmerStockLedgerPdfData
  coldStorageName: string
  coldStorageAddress?: string
  filterSummaryLines: string[]
  generatedAt?: Date
}

export type FarmerStockLedgerExcelPackage = {
  buffer: ArrayBuffer
  fileName: string
  preview: {
    title: string
    subtitle: string
    dateLabel: string
    exportedRowCount: number
    headers: string[]
    rows: ExcelPreviewRow[]
    metaLines?: string[]
    stockSummary?: ExcelPreviewStockSummary
  }
}

export function hasFarmerStockLedgerExportRows(
  reportData: FarmerStockLedgerPdfData,
): boolean {
  return (
    reportData.incomingLedger.length > 0 || reportData.outgoingLedger.length > 0
  )
}

export async function buildFarmerStockLedgerExcelPackage({
  reportData,
  coldStorageName,
  coldStorageAddress,
  filterSummaryLines,
  generatedAt = new Date(),
}: BuildFarmerStockLedgerExcelPackageInput): Promise<FarmerStockLedgerExcelPackage> {
  if (!hasFarmerStockLedgerExportRows(reportData)) {
    throw new Error("No rows to export. Adjust filters or load report data.")
  }

  const ExcelJS = await loadExcelJS()
  const layout = getLedgerColumnLayout(
    reportData.sizeColumns,
    reportData.showStockFilter,
    reportData.showCustomMarka,
  )
  const columnCount = layout.headers.length
  const widthTracker = new ColumnWidthTracker(layout.headers)

  const incomingBody = ledgerItemsToBodyRows(
    reportData.incomingLedger,
    layout,
    reportData.showStockFilter,
    reportData.showCustomMarka,
  )
  const outgoingBody = ledgerItemsToBodyRows(
    reportData.outgoingLedger,
    layout,
    reportData.showStockFilter,
    reportData.showCustomMarka,
  )

  const incomingTotals = createTotalsRowValues(
    layout,
    "Total",
    reportData.incomingFooterSizes,
    reportData.incomingClosingBalance,
  )
  const outgoingTotals = createTotalsRowValues(
    layout,
    "Closing Balance",
    reportData.outgoingFooterSizes,
    reportData.outgoingClosingBalance,
  )

  const incomingSection = createSectionTitleRow("Incoming Details", columnCount)
  const outgoingSection = createSectionTitleRow("Outgoing Details", columnCount)
  const incomingTotalsRow = createTotalsBodyRow(incomingTotals)
  const outgoingTotalsRow = createTotalsBodyRow(outgoingTotals)

  const safeName =
    coldStorageName
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ") || "Cold Storage"

  const dateLabel = getExportDateLabel(generatedAt)
  const fileName = `${safeName} Farmer Stock Ledger ${dateLabel}.xlsx`

  const metaLines = [
    `Farmer: ${reportData.farmer.name}`,
    typeof reportData.farmer.accountNumber === "number"
      ? `Account: ${reportData.farmer.accountNumber.toLocaleString("en-IN")}`
      : null,
    `Mobile: ${reportData.farmer.mobileNumber}`,
    coldStorageAddress?.trim() ? coldStorageAddress.trim() : null,
    ...filterSummaryLines,
  ].filter((line): line is string => Boolean(line))

  const workbook = new ExcelJS.Workbook()
  workbook.creator = safeName
  const worksheet = workbook.addWorksheet("Farmer Stock Ledger")
  configureWorksheetForMicrosoftExcel(worksheet)

  addMergedHeaderRow(worksheet, 1, columnCount, safeName, {
    height: EXCEL_TITLE_ROW_HEIGHT,
    font: { ...FONTS.title, color: { argb: COLORS.titleFg } },
    fillArgb: COLORS.titleBg,
  })

  addMergedHeaderRow(worksheet, 2, columnCount, "Farmer Stock Ledger", {
    height: EXCEL_SUBTITLE_ROW_HEIGHT,
    font: { ...FONTS.subtitle, color: { argb: COLORS.subtitleFg } },
    fillArgb: COLORS.subtitleBg,
  })

  addMergedHeaderRow(
    worksheet,
    3,
    columnCount,
    `Generated on: ${dateLabel}`,
    {
      height: 20,
      font: { ...FONTS.date, color: { argb: COLORS.dateFg } },
      fillArgb: COLORS.dateBg,
    },
  )

  if (metaLines.length > 0) {
    addMergedHeaderRow(worksheet, 4, columnCount, metaLines.join("  |  "), {
      height: metaLines.length > 1 ? 28 : 20,
      font: { ...FONTS.date, color: { argb: COLORS.dateFg } },
      fillArgb: COLORS.dateBg,
    })
  }

  const poweredByRowIndex = metaLines.length > 0 ? 5 : 4
  addMergedHeaderRow(worksheet, poweredByRowIndex, columnCount, "Powered by Coldop", {
    height: 18,
    font: {
      name: "Calibri",
      size: 9,
      italic: true,
      color: { argb: "FF9CA3AF" },
    },
    fillArgb: COLORS.titleBg,
  })

  worksheet.addRow([])

  const previewRows: ExcelPreviewRow[] = []

  const stockSummary = addStockSummaryRows(
    worksheet,
    reportData.stockSummary,
    reportData.sizeColumns,
    columnCount,
    widthTracker,
  )

  addBodyRow(worksheet, incomingSection, columnCount, widthTracker)
  previewRows.push(incomingSection)

  addColumnHeaderRow(worksheet, layout.headers)

  addStyledBodyRows(
    worksheet,
    incomingBody,
    columnCount,
    widthTracker,
    previewRows,
  )

  addTotalsRow(worksheet, incomingTotals, columnCount)
  previewRows.push(incomingTotalsRow)

  worksheet.addRow([])

  addBodyRow(worksheet, outgoingSection, columnCount, widthTracker)
  previewRows.push(outgoingSection)

  addColumnHeaderRow(worksheet, layout.headers)

  addStyledBodyRows(
    worksheet,
    outgoingBody,
    columnCount,
    widthTracker,
    previewRows,
  )

  addTotalsRow(worksheet, outgoingTotals, columnCount)
  previewRows.push(outgoingTotalsRow)

  worksheet.columns = layout.headers.map((header, index) => ({
    key: header,
    width: widthTracker.finalize()[index],
  }))

  const buffer = (await workbook.xlsx.writeBuffer({
    useSharedStrings: true,
  })) as ArrayBuffer
  const exportedRowCount = incomingBody.length + outgoingBody.length

  return {
    buffer,
    fileName,
    preview: {
      title: safeName,
      subtitle: "Farmer Stock Ledger",
      dateLabel,
      exportedRowCount,
      headers: layout.headers,
      rows: previewRows,
      metaLines,
      stockSummary,
    },
  }
}
