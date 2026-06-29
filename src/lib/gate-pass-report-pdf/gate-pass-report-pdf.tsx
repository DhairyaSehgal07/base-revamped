import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { formatGatePassReportGeneratedAt } from "@/lib/gate-pass-report-pdf/build-table-report-pdf-data"
import {
  chunkGatePassReportRows,
  GATE_PASS_REPORT_LEDGER_ROWS_PER_PAGE,
  GATE_PASS_REPORT_ROWS_PER_PAGE,
} from "@/lib/gate-pass-report-pdf/chunk-report-rows"
import { registerGatePassReportPdfFonts } from "@/lib/gate-pass-report-pdf/register-pdf-fonts"
import type {
  GatePassReportPdfCell,
  GatePassReportPdfColumn,
  GatePassReportPdfDisplayAlign,
  GatePassReportPdfRow,
  GatePassReportPdfStackedLine,
  GatePassReportPdfTableVariant,
  GenerateGatePassReportPdfInput,
} from "@/lib/gate-pass-report-pdf/types"
import { COLDOP_BRANDING } from "@/lib/export-report-theme"

registerGatePassReportPdfFonts()

const COLOR = {
  ink: "#09090b",
  inkSoft: "#71717a",
  inkMuted: "#a1a1aa",
  hairline: "#e4e4e7",
  hairlineStrong: "#09090b",
  paper: "#ffffff",
  wash: "#f8f9fa",
  accent: "#008235",
  accentWash: "#ecfdf5",
  groupFill: "#f4f4f5",
  zebra: "#fafafa",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 24,
    fontFamily: "Roboto",
    fontWeight: 400,
    backgroundColor: COLOR.paper,
    color: COLOR.ink,
    fontSize: 7,
  },
  letterhead: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  logoMark: {
    width: 36,
    height: 36,
  },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: COLOR.paper,
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  storageName: {
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  storageMeta: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginTop: 2,
    textAlign: "center",
  },
  reportTitleHeader: {
    fontSize: 9,
    color: COLOR.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
    fontFamily: "Roboto",
    fontWeight: 700,
    textAlign: "center",
  },
  docRefLabel: {
    fontSize: 6,
    color: COLOR.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "right",
  },
  docRefValue: {
    fontSize: 7,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 700,
    marginTop: 1,
    textAlign: "right",
  },
  headerDivider: {
    height: 2,
    backgroundColor: COLOR.accent,
    marginBottom: 1,
  },
  headerDividerThin: {
    height: 1,
    backgroundColor: COLOR.hairline,
    marginBottom: 8,
  },
  continuationHeader: {
    marginBottom: 8,
  },
  continuationTitle: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: "center",
  },
  continuationMeta: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginTop: 2,
    textAlign: "center",
  },
  metaBlock: {
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginBottom: 2,
  },
  filterLine: {
    fontSize: 6.5,
    color: COLOR.inkSoft,
    marginBottom: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: COLOR.hairline,
    borderRadius: 4,
    overflow: "hidden",
  },
  ledgerTable: {
    width: "100%",
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.wash,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  ledgerTableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.wash,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.hairlineStrong,
    borderBottomWidth: 1.25,
    borderBottomColor: COLOR.hairlineStrong,
    paddingTop: 7,
    paddingBottom: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  ledgerTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    paddingTop: 7.5,
    paddingBottom: 7.5,
    alignItems: "center",
  },
  tableRowGroup: {
    backgroundColor: COLOR.groupFill,
  },
  ledgerTableRowGroup: {
    backgroundColor: COLOR.groupFill,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.hairline,
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableRowZebra: {
    backgroundColor: COLOR.zebra,
  },
  tableFooterRow: {
    flexDirection: "row",
    backgroundColor: COLOR.accentWash,
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
  },
  ledgerTableFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.hairlineStrong,
    paddingTop: 7,
    paddingBottom: 7,
    marginTop: -0.5,
  },
  headerCell: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    fontSize: 6.5,
  },
  ledgerHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ledgerHeaderCellCenter: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  bodyCell: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontSize: 6.5,
    color: COLOR.ink,
  },
  ledgerBodyCell: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  ledgerBodyCellBold: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  ledgerBodyCellMuted: {
    fontSize: 9,
    color: COLOR.inkMuted,
    textAlign: "center",
  },
  bodyCellEmpty: {
    color: COLOR.inkMuted,
  },
  footerCell: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    fontSize: 6.5,
  },
  ledgerFooterCell: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
  },
  ledgerFooterLabel: {
    fontSize: 8,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stackedCell: {
    alignItems: "center",
  },
  subText: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginTop: 1.5,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  alignLeft: {
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
  },
  alignCenter: {
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 16,
  },
  footerRule: {
    height: 1,
    backgroundColor: COLOR.hairline,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerColLeft: {
    flex: 1,
  },
  footerColCenter: {
    flex: 1,
    alignItems: "center",
  },
  footerColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  footerDisclosure: {
    fontSize: 6,
    color: COLOR.inkMuted,
  },
  footerBrandText: {
    fontSize: 6,
    color: COLOR.inkSoft,
  },
  footerBrandHighlight: {
    color: COLOR.accent,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  footerPage: {
    fontSize: 6,
    color: COLOR.inkMuted,
  },
})

function getColumnFlex(align: "left" | "right", label: string): number {
  if (align === "right") return 0.7
  if (label.length > 14) return 1.4
  return 1
}

function getDisplayAlign(
  column: GatePassReportPdfColumn,
): GatePassReportPdfDisplayAlign {
  return column.displayAlign ?? (column.align === "right" ? "right" : "left")
}

function getFlexAlign(displayAlign: GatePassReportPdfDisplayAlign) {
  if (displayAlign === "center") return "center"
  if (displayAlign === "right") return "flex-end"
  return "flex-start"
}

function normalizeStack(
  stack: GatePassReportPdfStackedLine | GatePassReportPdfStackedLine[],
): GatePassReportPdfStackedLine[] {
  return Array.isArray(stack) ? stack : [stack]
}

function renderStackedLines(
  lines: GatePassReportPdfStackedLine[],
  isGroupRow: boolean,
) {
  return (
    <View style={styles.stackedCell}>
      {lines.map((line, index) => (
        <View key={`${line.main}-${index}`}>
          <Text
            style={
              isGroupRow ? styles.ledgerBodyCellBold : styles.ledgerBodyCellBold
            }
          >
            {line.main}
          </Text>
          {line.sub ? <Text style={styles.subText}>{line.sub}</Text> : null}
        </View>
      ))}
    </View>
  )
}

function renderPdfDataCell(
  cell: GatePassReportPdfCell,
  column: GatePassReportPdfColumn,
  isGroupRow: boolean,
  tableVariant: GatePassReportPdfTableVariant,
) {
  const displayAlign = getDisplayAlign(column)
  const flexAlign = getFlexAlign(displayAlign)

  if (tableVariant === "ledger") {
    if (cell.stack) {
      return (
        <View style={{ alignItems: flexAlign, paddingHorizontal: 3 }}>
          {renderStackedLines(normalizeStack(cell.stack), isGroupRow)}
        </View>
      )
    }

    const textStyle = cell.isEmpty
      ? styles.ledgerBodyCellMuted
      : isGroupRow
        ? styles.ledgerBodyCellBold
        : styles.ledgerBodyCell

    return (
      <View style={{ alignItems: flexAlign, paddingHorizontal: 3 }}>
        <Text
          style={[
            textStyle,
            displayAlign === "center"
              ? styles.alignCenter
              : displayAlign === "right"
                ? styles.alignRight
                : styles.alignLeft,
          ]}
        >
          {cell.text}
        </Text>
      </View>
    )
  }

  return (
    <Text
      style={[
        styles.bodyCell,
        cell.align === "right" ? styles.alignRight : styles.alignLeft,
        ...(cell.isEmpty ? [styles.bodyCellEmpty] : []),
        ...(isGroupRow ? [{ fontFamily: "Roboto", fontWeight: 700 }] : []),
      ]}
    >
      {cell.text}
    </Text>
  )
}

function ReportLetterhead({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  reportTitle,
  generatedAt,
}: Pick<
  GenerateGatePassReportPdfInput,
  | "coldStorageName"
  | "coldStorageAddress"
  | "coldStorageLogo"
  | "reportTitle"
  | "generatedAt"
>) {
  return (
    <>
      <View style={styles.letterhead}>
        <View style={styles.headerLeft}>
          {coldStorageLogo ? (
            <Image src={coldStorageLogo} style={styles.logoMark} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>
                {coldStorageName.charAt(0) || "C"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.storageName}>{coldStorageName}</Text>
          {coldStorageAddress ? (
            <Text style={styles.storageMeta}>{coldStorageAddress}</Text>
          ) : null}
          <Text style={styles.reportTitleHeader}>{reportTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.docRefLabel}>Generated On</Text>
          <Text style={styles.docRefValue}>
            {formatGatePassReportGeneratedAt(generatedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.headerDivider} />
      <View style={styles.headerDividerThin} />
    </>
  )
}

function ReportContinuationHeader({
  reportTitle,
  periodLabel,
  pageNumber,
}: {
  reportTitle: string
  periodLabel: string
  pageNumber: number
}) {
  return (
    <View style={styles.continuationHeader}>
      <Text style={styles.continuationTitle}>
        {reportTitle} (continued)
      </Text>
      <Text style={styles.continuationMeta}>
        {periodLabel} · Page {pageNumber}
      </Text>
      <View style={styles.headerDividerThin} />
    </View>
  )
}

function ReportMetaBlock({
  periodLabel,
  entryCountLabel,
  filterSummaryLines,
}: Pick<
  GenerateGatePassReportPdfInput,
  "periodLabel" | "entryCountLabel" | "filterSummaryLines"
>) {
  return (
    <View style={styles.metaBlock}>
      <Text style={styles.metaLine}>
        Period: {periodLabel} | {entryCountLabel}
      </Text>
      {filterSummaryLines.length > 0 ? (
        filterSummaryLines.map((line) => (
          <Text key={line} style={styles.filterLine}>
            {line}
          </Text>
        ))
      ) : (
        <Text style={styles.filterLine}>Filters: none applied</Text>
      )}
    </View>
  )
}

function ReportTableHeader({
  columns,
  columnFlex,
  tableVariant,
}: {
  columns: GatePassReportPdfColumn[]
  columnFlex: number[]
  tableVariant: GatePassReportPdfTableVariant
}) {
  const isLedger = tableVariant === "ledger"

  return (
    <View style={isLedger ? styles.ledgerTableHeaderRow : styles.tableHeaderRow}>
      {columns.map((column, index) => {
        const displayAlign = getDisplayAlign(column)

        return (
          <View
            key={`${column.label}-${index}`}
            style={{
              flex: columnFlex[index],
              alignItems: getFlexAlign(displayAlign),
              paddingHorizontal: isLedger ? 3 : 0,
            }}
          >
            <Text
              style={[
                isLedger
                  ? displayAlign === "center"
                    ? styles.ledgerHeaderCellCenter
                    : styles.ledgerHeaderCell
                  : styles.headerCell,
                displayAlign === "center"
                  ? styles.alignCenter
                  : displayAlign === "right"
                    ? styles.alignRight
                    : styles.alignLeft,
              ]}
            >
              {column.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

function ReportTableBody({
  rows,
  columns,
  columnFlex,
  rowOffset,
  tableVariant,
}: {
  rows: GatePassReportPdfRow[]
  columns: GatePassReportPdfColumn[]
  columnFlex: number[]
  rowOffset: number
  tableVariant: GatePassReportPdfTableVariant
}) {
  const isLedger = tableVariant === "ledger"

  return (
    <>
      {rows.map((row, rowIndex) => {
        const globalRowIndex = rowOffset + rowIndex

        return (
          <View
            key={`row-${globalRowIndex}`}
            style={[
              isLedger ? styles.ledgerTableRow : styles.tableRow,
              ...(row.isGroupRow
                ? [isLedger ? styles.ledgerTableRowGroup : styles.tableRowGroup]
                : []),
              ...(!row.isGroupRow && globalRowIndex % 2 === 1
                ? [styles.tableRowZebra]
                : []),
            ]}
          >
            {row.cells.map((cell, cellIndex) => (
              <View
                key={`cell-${globalRowIndex}-${cellIndex}`}
                style={{ flex: columnFlex[cellIndex] }}
              >
                {renderPdfDataCell(
                  cell,
                  columns[cellIndex]!,
                  row.isGroupRow === true,
                  tableVariant,
                )}
              </View>
            ))}
          </View>
        )
      })}
    </>
  )
}

function ReportTableFooter({
  footerCells,
  columns,
  columnFlex,
  tableVariant,
}: {
  footerCells: GatePassReportPdfCell[]
  columns: GatePassReportPdfColumn[]
  columnFlex: number[]
  tableVariant: GatePassReportPdfTableVariant
}) {
  const isLedger = tableVariant === "ledger"

  return (
    <View style={isLedger ? styles.ledgerTableFooterRow : styles.tableFooterRow}>
      {footerCells.map((cell, index) => {
        const column = columns[index]!
        const displayAlign = getDisplayAlign(column)
        const isTotalLabel = index === 0 && isLedger

        return (
          <View
            key={`footer-${index}`}
            style={{
              flex: columnFlex[index],
              alignItems: getFlexAlign(displayAlign),
              paddingHorizontal: isLedger ? 3 : 0,
            }}
          >
            <Text
              style={[
                isLedger
                  ? isTotalLabel
                    ? styles.ledgerFooterLabel
                    : styles.ledgerFooterCell
                  : styles.footerCell,
                displayAlign === "center"
                  ? styles.alignCenter
                  : displayAlign === "right"
                    ? styles.alignRight
                    : styles.alignLeft,
              ]}
            >
              {cell.text}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

function ReportPageFooter() {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRule} />
      <View style={styles.footerRow}>
        <View style={styles.footerColLeft}>
          <Text style={styles.footerDisclosure}>
            Computer-generated report.
          </Text>
        </View>
        <View style={styles.footerColCenter}>
          <Text style={styles.footerBrandText}>
            {COLDOP_BRANDING.label}
            <Text style={styles.footerBrandHighlight}>
              {COLDOP_BRANDING.name}
            </Text>
          </Text>
        </View>
        <View style={styles.footerColRight}>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </View>
    </View>
  )
}

function GatePassReportPage({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  reportTitle,
  generatedAt,
  periodLabel,
  entryCountLabel,
  filterSummaryLines,
  columns,
  rows,
  footerCells,
  pageIndex,
  rowOffset,
  isFirstPage,
  isLastPage,
  tableVariant = "default",
}: GenerateGatePassReportPdfInput & {
  rows: GatePassReportPdfRow[]
  pageIndex: number
  rowOffset: number
  isFirstPage: boolean
  isLastPage: boolean
}) {
  const columnFlex = columns.map((column) =>
    getColumnFlex(column.align, column.label),
  )
  const isLedger = tableVariant === "ledger"

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      {isFirstPage ? (
        <ReportLetterhead
          coldStorageName={coldStorageName}
          coldStorageAddress={coldStorageAddress}
          coldStorageLogo={coldStorageLogo}
          reportTitle={reportTitle}
          generatedAt={generatedAt}
        />
      ) : (
        <ReportContinuationHeader
          reportTitle={reportTitle}
          periodLabel={periodLabel}
          pageNumber={pageIndex + 1}
        />
      )}

      {isFirstPage ? (
        <ReportMetaBlock
          periodLabel={periodLabel}
          entryCountLabel={entryCountLabel}
          filterSummaryLines={filterSummaryLines}
        />
      ) : null}

      <View style={isLedger ? styles.ledgerTable : styles.table}>
        <ReportTableHeader
          columns={columns}
          columnFlex={columnFlex}
          tableVariant={tableVariant}
        />
        <ReportTableBody
          rows={rows}
          columns={columns}
          columnFlex={columnFlex}
          rowOffset={rowOffset}
          tableVariant={tableVariant}
        />
        {isLastPage ? (
          <ReportTableFooter
            footerCells={footerCells}
            columns={columns}
            columnFlex={columnFlex}
            tableVariant={tableVariant}
          />
        ) : null}
      </View>

      <ReportPageFooter />
    </Page>
  )
}

export default function GatePassReportPdf(props: GenerateGatePassReportPdfInput) {
  const rowsPerPage =
    props.rowsPerPage ??
    (props.tableVariant === "ledger"
      ? GATE_PASS_REPORT_LEDGER_ROWS_PER_PAGE
      : GATE_PASS_REPORT_ROWS_PER_PAGE)
  const rowPages = chunkGatePassReportRows(props.rows, rowsPerPage)

  return (
    <Document
      author="Coldop"
      keywords="cold storage, gate pass report"
      subject={props.reportTitle}
      title={`${props.reportTitle} — ${props.coldStorageName}`}
    >
      {rowPages.map((pageRows, pageIndex) => (
        <GatePassReportPage
          key={`page-${pageIndex}`}
          {...props}
          rows={pageRows}
          pageIndex={pageIndex}
          rowOffset={rowPages
            .slice(0, pageIndex)
            .reduce((total, page) => total + page.length, 0)}
          isFirstPage={pageIndex === 0}
          isLastPage={pageIndex === rowPages.length - 1}
        />
      ))}
    </Document>
  )
}
