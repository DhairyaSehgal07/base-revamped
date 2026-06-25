import type { Table } from "@tanstack/react-table"

import type { IncomingGatePassReportRecord } from "@/features/incoming-report/api/types"
import type { IncomingQuantityMode } from "@/features/incoming-report/components/columns"
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
} from "@/features/incoming-report/utils/export-cell-value"
import { buildTableReportPdfData } from "@/lib/gate-pass-report-pdf/build-table-report-pdf-data"
import type { GatePassReportPdfData } from "@/lib/gate-pass-report-pdf/types"

export type BuildIncomingReportPdfDataInput = {
  table: Table<IncomingGatePassReportRecord>
  quantityMode: IncomingQuantityMode
  reportTitle?: string
  dateFrom?: string
  dateTo?: string
  generatedAt?: Date
}

export function buildIncomingReportPdfData({
  table,
  quantityMode,
  reportTitle = "Incoming Report",
  dateFrom,
  dateTo,
  generatedAt,
}: BuildIncomingReportPdfDataInput): GatePassReportPdfData {
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
