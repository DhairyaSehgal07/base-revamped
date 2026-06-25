import type { Table } from "@tanstack/react-table"

import type { OutgoingGatePassReportRecord } from "@/features/outgoing-report/api/types"
import type { OutgoingQuantityMode } from "@/features/outgoing-report/components/columns"
import {
  buildFilterSummaryLines,
  collectExportRows,
  exportCellValueToDisplay,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from "@/features/outgoing-report/utils/export-cell-value"
import { buildTableReportPdfData } from "@/lib/gate-pass-report-pdf/build-table-report-pdf-data"
import type { GatePassReportPdfData } from "@/lib/gate-pass-report-pdf/types"

export type BuildOutgoingReportPdfDataInput = {
  table: Table<OutgoingGatePassReportRecord>
  quantityMode: OutgoingQuantityMode
  reportTitle?: string
  dateFrom?: string
  dateTo?: string
  generatedAt?: Date
}

export function buildOutgoingReportPdfData({
  table,
  quantityMode,
  reportTitle = "Outgoing Report",
  dateFrom,
  dateTo,
  generatedAt,
}: BuildOutgoingReportPdfDataInput): GatePassReportPdfData {
  return buildTableReportPdfData({
    table,
    reportTitle,
    dateFrom,
    dateTo,
    generatedAt,
    formatDateRangeLabel,
    getFilteredLeafRowCount,
    buildFilterSummaryLines: (reportTable) =>
      buildFilterSummaryLines(reportTable, quantityMode),
    collectExportRows,
    getColumnExportLabel,
    getExportCellForRow: (row, column) =>
      getExportCellForRow(row, column, quantityMode),
    getFooterExportValue: (columnId, rows) =>
      getFooterExportValue(columnId, rows, quantityMode),
    isSummableExportColumn,
    exportCellValueToDisplay,
  })
}
