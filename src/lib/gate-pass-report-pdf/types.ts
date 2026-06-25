export type GatePassReportPdfAlign = "left" | "right"

export type GatePassReportPdfCell = {
  text: string
  align: GatePassReportPdfAlign
  isEmpty?: boolean
}

export type GatePassReportPdfColumn = {
  label: string
  align: GatePassReportPdfAlign
}

export type GatePassReportPdfRow = {
  cells: GatePassReportPdfCell[]
  isGroupRow?: boolean
}

export type GatePassReportPdfData = {
  reportTitle: string
  generatedAt: Date
  periodLabel: string
  entryCountLabel: string
  filterSummaryLines: string[]
  columns: GatePassReportPdfColumn[]
  rows: GatePassReportPdfRow[]
  footerCells: GatePassReportPdfCell[]
}

export type GenerateGatePassReportPdfInput = GatePassReportPdfData & {
  coldStorageName: string
  coldStorageAddress?: string
  coldStorageLogo?: string
}
