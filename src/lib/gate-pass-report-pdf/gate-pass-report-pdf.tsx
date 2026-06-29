import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { formatGatePassReportGeneratedAt } from "@/lib/gate-pass-report-pdf/build-table-report-pdf-data"
import { chunkGatePassReportRows } from "@/lib/gate-pass-report-pdf/chunk-report-rows"
import { registerGatePassReportPdfFonts } from "@/lib/gate-pass-report-pdf/register-pdf-fonts"
import type {
  GatePassReportPdfCell,
  GatePassReportPdfColumn,
  GatePassReportPdfRow,
  GenerateGatePassReportPdfInput,
} from "@/lib/gate-pass-report-pdf/types"
import { COLDOP_BRANDING } from "@/lib/export-report-theme"

registerGatePassReportPdfFonts()

const COLOR = {
  ink: "#09090b",
  inkSoft: "#71717a",
  inkMuted: "#a1a1aa",
  hairline: "#e4e4e7",
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
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.wash,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  tableRowGroup: {
    backgroundColor: COLOR.groupFill,
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
  headerCell: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    fontSize: 6.5,
  },
  bodyCell: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontSize: 6.5,
    color: COLOR.ink,
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
  alignLeft: {
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
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
}: {
  columns: GatePassReportPdfColumn[]
  columnFlex: number[]
}) {
  return (
    <View style={styles.tableHeaderRow}>
      {columns.map((column, index) => (
        <View key={`${column.label}-${index}`} style={{ flex: columnFlex[index] }}>
          <Text
            style={[
              styles.headerCell,
              column.align === "right" ? styles.alignRight : styles.alignLeft,
            ]}
          >
            {column.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

function ReportTableBody({
  rows,
  columnFlex,
  rowOffset,
}: {
  rows: GatePassReportPdfRow[]
  columnFlex: number[]
  rowOffset: number
}) {
  return (
    <>
      {rows.map((row, rowIndex) => {
        const globalRowIndex = rowOffset + rowIndex

        return (
          <View
            key={`row-${globalRowIndex}`}
            style={[
              styles.tableRow,
              ...(row.isGroupRow ? [styles.tableRowGroup] : []),
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
                <Text
                  style={[
                    styles.bodyCell,
                    cell.align === "right"
                      ? styles.alignRight
                      : styles.alignLeft,
                    ...(cell.isEmpty ? [styles.bodyCellEmpty] : []),
                    ...(row.isGroupRow
                      ? [{ fontFamily: "Roboto", fontWeight: 700 }]
                      : []),
                  ]}
                >
                  {cell.text}
                </Text>
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
  columnFlex,
}: {
  footerCells: GatePassReportPdfCell[]
  columnFlex: number[]
}) {
  return (
    <View style={styles.tableFooterRow}>
      {footerCells.map((cell, index) => (
        <View key={`footer-${index}`} style={{ flex: columnFlex[index] }}>
          <Text
            style={[
              styles.footerCell,
              cell.align === "right" ? styles.alignRight : styles.alignLeft,
            ]}
          >
            {cell.text}
          </Text>
        </View>
      ))}
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

      <View style={styles.table}>
        <ReportTableHeader columns={columns} columnFlex={columnFlex} />
        <ReportTableBody
          rows={rows}
          columnFlex={columnFlex}
          rowOffset={rowOffset}
        />
        {isLastPage ? (
          <ReportTableFooter footerCells={footerCells} columnFlex={columnFlex} />
        ) : null}
      </View>

      <ReportPageFooter />
    </Page>
  )
}

export default function GatePassReportPdf(props: GenerateGatePassReportPdfInput) {
  const rowPages = chunkGatePassReportRows(props.rows)

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
