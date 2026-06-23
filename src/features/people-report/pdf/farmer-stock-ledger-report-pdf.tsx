import {
  Text,
  Page,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Path,
  Font,
} from "@react-pdf/renderer";

import type {
  FarmerStockLedgerPdfData,
  PdfLedgerRow,
  PdfLedgerSizeValue,
} from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data";
import type { StockSummaryMatrix } from "@/features/people/utils/build-farmer-stock-summary";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfChc9AMP6lbBP.ttf",
      fontWeight: 700,
    },
  ],
});

export type FarmerStockLedgerReportProps = FarmerStockLedgerPdfData & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
  coldopLogo?: string;
};

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
  borderLight: "#f4f4f5",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 34,
    fontFamily: "Roboto",
    fontWeight: 400,
    backgroundColor: COLOR.paper,
    color: COLOR.ink,
  },
  letterhead: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
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
    width: 48,
    height: 48,
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: COLOR.paper,
    fontSize: 20,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  storageName: {
    fontSize: 24,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  storageMeta: {
    fontSize: 9,
    color: COLOR.inkSoft,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  reportTitleHeader: {
    fontSize: 11,
    color: COLOR.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 8,
    fontFamily: "Roboto",
    fontWeight: 700,
    textAlign: "center",
  },
  docRefBlock: {
    alignItems: "flex-end",
  },
  docRefLabel: {
    fontSize: 7,
    color: COLOR.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  docRefValue: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 700,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: COLOR.hairlineStrong,
    marginBottom: 2,
  },
  headerDividerThin: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    marginBottom: 20,
  },
  farmerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    marginBottom: 24,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  farmerCol: {
    flexDirection: "column",
    flex: 1,
  },
  farmerColRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flex: 1,
  },
  reportEyebrow: {
    fontSize: 7.5,
    color: COLOR.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  farmerName: {
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  farmerAddress: {
    fontSize: 9,
    color: COLOR.inkSoft,
    lineHeight: 1.4,
  },
  farmerMobile: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    marginTop: 4,
  },
  statBlock: {
    marginLeft: 32,
    minWidth: 100,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconBoxIncoming: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLOR.accentWash,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  iconBoxOutgoing: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLOR.wash,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  statLabel: {
    fontSize: 9,
    color: COLOR.inkSoft,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  statMainVal: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    marginBottom: 2,
  },
  statSubVal: {
    fontSize: 9,
    color: COLOR.inkSoft,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 9,
  },
  sectionTick: {
    width: 4,
    height: 12,
    backgroundColor: COLOR.accent,
    marginRight: 7,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginRight: 10,
  },
  sectionRule: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  ledgerTableSection: {
    marginBottom: 28,
  },
  outgoingSectionHeader: {
    marginTop: 12,
  },
  sumContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.borderLight,
    marginBottom: 24,
    overflow: "hidden",
  },
  sumRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borderLight,
  },
  sumRowNoBorder: {
    flexDirection: "row",
  },
  sumHeaderBg: { backgroundColor: COLOR.wash },
  sumTotalRowBg: { backgroundColor: COLOR.wash },
  sumTotalColBg: { backgroundColor: COLOR.wash },
  sumBorderRight: {
    borderRightWidth: 1,
    borderRightColor: COLOR.borderLight,
  },
  sumCellHeaderLeft: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
  },
  sumCellHeader: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: "right",
  },
  sumCellVar: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
  },
  sumCellValueBlack: {
    fontSize: 9,
    color: COLOR.ink,
    textAlign: "right",
  },
  sumCellValueGreen: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    textAlign: "right",
  },
  sumCellTotalBlack: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: "right",
  },
  table: { width: "100%", marginBottom: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.wash,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.ink,
    borderBottomWidth: 1.25,
    borderBottomColor: COLOR.ink,
    paddingTop: 7,
    paddingBottom: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    paddingTop: 7.5,
    paddingBottom: 7.5,
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "#fafafa" },
  highlightRow: {
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
  },
  highlightFooterRow: {
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.ink,
    paddingTop: 7,
    paddingBottom: 7,
    marginTop: -0.5,
  },
  tableCellHeader: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableCellHeaderCenter: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  tableCell: { fontSize: 9, color: COLOR.inkSoft },
  tableCellData: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  tableCellMono: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Courier",
    fontWeight: 400,
  },
  tableCellBold: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  tableCellAccent: {
    fontSize: 9,
    color: COLOR.accent,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  tableCellMuted: {
    fontSize: 9,
    color: COLOR.inkMuted,
    textAlign: "center",
  },
  stackedCell: { alignItems: "center" },
  stackedHeaderCell: { alignItems: "center", justifyContent: "center" },
  subText: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginTop: 1.5,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  totalsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalsLabel: {
    fontSize: 8,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: "center",
  },
  totalsSizeValue: {
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: "center",
  },
  footer: { position: "absolute", bottom: 20, left: 34, right: 34 },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerCol: {
    flex: 1,
  },
  footerColLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  footerColCenter: {
    flex: 1,
    alignItems: "center",
  },
  footerColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  footerDisclosure: { fontSize: 7, color: COLOR.inkMuted },
  footerBrand: { flexDirection: "row", alignItems: "center" },
  footerBrandLogo: { width: 11, height: 11, marginRight: 5 },
  footerBrandText: { fontSize: 7, color: COLOR.inkMuted, letterSpacing: 0.4 },
  footerBrandHighlight: {
    fontFamily: "Roboto",
    fontWeight: 700,
    color: COLOR.inkSoft,
  },
  footerPage: { fontSize: 7, color: COLOR.inkMuted },
});

function getSummarySizeWidth(sizeCount: number): string {
  if (sizeCount <= 0) return "0%";
  const remaining = 100 - 18 - 14;
  return `${remaining / sizeCount}%`;
}

function getLedgerLayout(
  sizeCount: number,
  showStockFilter: boolean,
  showCustomMarka: boolean,
) {
  const date = 9;
  const gatePass = 7;
  const variety = 11;
  const stockFilter = showStockFilter ? 8 : 0;
  const customMarka = showCustomMarka ? 8 : 0;
  const total = 7;
  const remarks = 9;
  const fixed = date + gatePass + variety + stockFilter + customMarka + total + remarks;
  const sizeWidth = sizeCount > 0 ? (100 - fixed) / sizeCount : 0;

  return {
    date: `${date}%`,
    gatePass: `${gatePass}%`,
    variety: `${variety}%`,
    stockFilter: showStockFilter ? `${stockFilter}%` : null,
    customMarka: showCustomMarka ? `${customMarka}%` : null,
    size: `${sizeWidth}%`,
    total: `${total}%`,
    remarks: `${remarks}%`,
    leading: `${date + gatePass + variety + stockFilter + customMarka}%`,
  };
}

function renderSummaryValue(val: number) {
  const num = Number(val);
  if (num > 0) {
    return <Text style={styles.sumCellValueGreen}>{num.toLocaleString("en-IN")}</Text>;
  }
  return <Text style={styles.sumCellValueBlack}>{num}</Text>;
}

function SummaryTable({
  matrix,
  sizeColumns,
}: {
  matrix: StockSummaryMatrix;
  sizeColumns: string[];
}) {
  const sizeWidth = getSummarySizeWidth(sizeColumns.length);

  return (
    <View style={styles.sumContainer}>
      <View style={[styles.sumRow, styles.sumHeaderBg]}>
        <View style={[{ width: "18%" }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
          <Text style={styles.sumCellHeaderLeft}>Varieties</Text>
        </View>
        {sizeColumns.map((size) => (
          <View
            key={size}
            style={[{ width: sizeWidth }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}
          >
            <Text style={styles.sumCellHeader}>{size}</Text>
          </View>
        ))}
        <View style={[{ width: "14%" }, styles.sumTotalColBg, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
          <Text style={styles.sumCellHeader}>Total</Text>
        </View>
      </View>

      {matrix.rows.map((row, index) => (
        <View key={`${row.variety}-${index}`} style={styles.sumRow}>
          <View style={[{ width: "18%" }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
            <Text style={styles.sumCellVar}>{row.variety}</Text>
          </View>
          {sizeColumns.map((size) => (
            <View
              key={size}
              style={[{ width: sizeWidth }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}
            >
              {renderSummaryValue(row.bySize[size] ?? 0)}
            </View>
          ))}
          <View style={[{ width: "14%" }, styles.sumTotalColBg, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
            {renderSummaryValue(row.total)}
          </View>
        </View>
      ))}

      <View style={[styles.sumRowNoBorder, styles.sumTotalRowBg]}>
        <View style={[{ width: "18%" }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
          <Text style={styles.sumCellVar}>Bag Total</Text>
        </View>
        {sizeColumns.map((size) => (
          <View
            key={size}
            style={[{ width: sizeWidth }, styles.sumBorderRight, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}
          >
            <Text style={styles.sumCellTotalBlack}>
              {(matrix.footerBySize[size] ?? 0).toLocaleString("en-IN")}
            </Text>
          </View>
        ))}
        <View style={[{ width: "14%" }, styles.sumTotalColBg, { paddingVertical: 10, paddingHorizontal: 8, justifyContent: "center" }]}>
          <Text style={styles.sumCellValueGreen}>
            {matrix.grandTotal.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </View>
  );
}

function renderSizeCell(value: PdfLedgerSizeValue | null | undefined) {
  if (!value) {
    return <Text style={styles.tableCellMuted}>—</Text>;
  }

  if (value.type === "stacked") {
    return (
      <View style={styles.stackedCell}>
        <Text style={styles.tableCellBold}>{value.main}</Text>
        <Text style={styles.subText}>{value.sub}</Text>
      </View>
    );
  }

  return <Text style={styles.tableCellData}>{value.value}</Text>;
}

function LedgerTable({
  data,
  sizeColumns,
  footerLabel,
  footerSizeTotals,
  closingBalance,
  showStockFilter,
  showCustomMarka,
}: {
  data: PdfLedgerRow[];
  sizeColumns: string[];
  footerLabel: string;
  footerSizeTotals: Record<string, number>;
  closingBalance: number;
  showStockFilter: boolean;
  showCustomMarka: boolean;
}) {
  const layout = getLedgerLayout(
    sizeColumns.length,
    showStockFilter,
    showCustomMarka,
  );

  const getRowStyle = (row: PdfLedgerRow, index: number) => {
    if (row.isOpeningBalance) {
      return [styles.tableRow, styles.highlightRow];
    }

    if (index % 2 === 1) {
      return [styles.tableRow, styles.tableRowAlt];
    }

    return [styles.tableRow];
  };

  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        <View style={{ width: layout.date, paddingLeft: 6 }}>
          <Text style={styles.tableCellHeader}>Date</Text>
        </View>
        <View style={{ width: layout.gatePass }}>
          <Text style={styles.tableCellHeader}>Gate Pass</Text>
        </View>
        <View style={{ width: layout.variety }}>
          <Text style={styles.tableCellHeader}>Variety</Text>
        </View>
        {showStockFilter ? (
          <View style={{ width: layout.stockFilter! }}>
            <Text style={styles.tableCellHeader}>Filter</Text>
          </View>
        ) : null}
        {showCustomMarka ? (
          <View style={{ width: layout.customMarka! }}>
            <Text style={styles.tableCellHeader}>Marka</Text>
          </View>
        ) : null}
        {sizeColumns.map((size) => (
          <View key={size} style={{ width: layout.size, alignItems: "center" }}>
            <Text style={styles.tableCellHeaderCenter}>{size}</Text>
          </View>
        ))}
        <View style={{ width: layout.total, alignItems: "center" }}>
          <View style={styles.stackedHeaderCell}>
            <Text style={styles.tableCellHeaderCenter}>Total</Text>
            <Text style={styles.tableCellHeaderCenter}>Bags</Text>
          </View>
        </View>
        <View style={{ width: layout.remarks, paddingRight: 6 }}>
          <Text style={styles.tableCellHeader}>Remarks</Text>
        </View>
      </View>

      {data.map((row, index) => (
        <View
          key={`${row.gatePass}-${row.date}-${index}`}
          style={getRowStyle(row, index)}
        >
          <View style={{ width: layout.date, paddingLeft: 6 }}>
            <Text
              style={
                row.isOpeningBalance ? styles.tableCellAccent : styles.tableCellData
              }
            >
              {row.date}
            </Text>
          </View>
          <View style={{ width: layout.gatePass }}>
            <Text style={styles.tableCellMono}>{row.gatePass}</Text>
          </View>
          <View style={{ width: layout.variety }}>
            <Text style={styles.tableCellBold}>{row.variety}</Text>
          </View>
          {showStockFilter ? (
            <View style={{ width: layout.stockFilter! }}>
              <Text style={styles.tableCellData}>{row.stockFilter}</Text>
            </View>
          ) : null}
          {showCustomMarka ? (
            <View style={{ width: layout.customMarka! }}>
              <Text style={styles.tableCellData}>{row.customMarka}</Text>
            </View>
          ) : null}
          {sizeColumns.map((size) => (
            <View key={size} style={{ width: layout.size, alignItems: "center" }}>
              {renderSizeCell(row.sizes[size])}
            </View>
          ))}
          <View style={{ width: layout.total, alignItems: "center" }}>
            <Text style={styles.tableCellBold}>{row.total}</Text>
          </View>
          <View style={{ width: layout.remarks, paddingRight: 6 }}>
            <Text style={styles.tableCellData}>{row.remarks}</Text>
          </View>
        </View>
      ))}

      {data.length > 0 ? (
        <View style={[styles.totalsRow, styles.highlightFooterRow]}>
          <View style={{ width: layout.leading, paddingLeft: 9 }}>
            <Text style={styles.totalsLabel}>{footerLabel}</Text>
          </View>
          {sizeColumns.map((size) => {
            const value = footerSizeTotals[size] ?? 0
            return (
              <View
                key={size}
                style={{ width: layout.size, alignItems: "center" }}
              >
                <Text style={styles.totalsSizeValue}>
                  {value !== 0 ? value.toLocaleString("en-IN") : "—"}
                </Text>
              </View>
            )
          })}
          <View style={{ width: layout.total, alignItems: "center" }}>
            <Text style={styles.totalsValue}>
              {closingBalance.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={{ width: layout.remarks }} />
        </View>
      ) : null}
    </View>
  );
}

function CenteredLetterhead({
  storageName,
  storageLocation,
  coldStorageLogo,
  generatedAt,
}: {
  storageName: string;
  storageLocation?: string;
  coldStorageLogo?: string;
  generatedAt: string;
}) {
  return (
    <View>
      <View style={styles.letterhead}>
        <View style={styles.headerLeft}>
          {coldStorageLogo ? (
            <Image src={coldStorageLogo} style={styles.logoMark} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>
                {storageName?.charAt(0) || "C"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.storageName}>{storageName}</Text>
          {storageLocation ? (
            <Text style={styles.storageMeta}>{storageLocation}</Text>
          ) : null}
          <Text style={styles.reportTitleHeader}>Farmer Stock Ledger</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.docRefBlock}>
            <Text style={styles.docRefLabel}>Generated On</Text>
            <Text style={styles.docRefValue}>{generatedAt}</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerDivider} />
      <View style={styles.headerDividerThin} />
    </View>
  );
}

function FarmerStockLedgerPage({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  coldopLogo,
  farmer,
  stats,
  stockSummary,
  sizeColumns,
  incomingLedger,
  outgoingLedger,
  incomingFooterSizes,
  outgoingFooterSizes,
  incomingClosingBalance,
  outgoingClosingBalance,
  showStockFilter,
  showCustomMarka,
  generatedAt,
}: FarmerStockLedgerReportProps) {
  const farmerAddressLines = farmer.address.split("\n").join("\n");

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <CenteredLetterhead
        storageName={coldStorageName}
        storageLocation={coldStorageAddress}
        coldStorageLogo={coldStorageLogo}
        generatedAt={generatedAt}
      />

      <View style={styles.farmerSection}>
        <View style={styles.farmerCol}>
          <Text style={styles.reportEyebrow}>Account Of</Text>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          <Text style={styles.farmerAddress}>{farmerAddressLines}</Text>
          <Text style={styles.farmerMobile}>{farmer.mobileNumber}</Text>
        </View>

        <View style={styles.farmerColRight}>
          <View style={styles.statBlock}>
            <View style={styles.statHeader}>
              <View style={styles.iconBoxIncoming}>
                <Svg width="10" height="10" viewBox="0 0 24 24">
                  <Path
                    d="M7 17L17 7 M7 17V8 M7 17H16"
                    stroke={COLOR.accent}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.statLabel}>Incoming</Text>
            </View>
            <Text style={styles.statMainVal}>
              {stats.incomingGatePassCount.toLocaleString("en-IN")} gate passes
            </Text>
            <Text style={[styles.statSubVal, { marginBottom: 2 }]}>
              {stats.incomingBags.toLocaleString("en-IN")} bags
            </Text>
            <Text style={styles.statSubVal}>
              {stats.incomingInternalBags.toLocaleString("en-IN")} bags (internal)
            </Text>
          </View>

          <View style={styles.statBlock}>
            <View style={styles.statHeader}>
              <View style={styles.iconBoxOutgoing}>
                <Svg width="10" height="10" viewBox="0 0 24 24">
                  <Path
                    d="M17 7L7 17 M17 7V16 M17 7H8"
                    stroke={COLOR.inkSoft}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.statLabel}>Outgoing</Text>
            </View>
            <Text style={styles.statMainVal}>
              {stats.outgoingGatePassCount.toLocaleString("en-IN")} gate passes
            </Text>
            <Text style={[styles.statSubVal, { marginBottom: 2 }]}>
              {stats.outgoingBags.toLocaleString("en-IN")} bags
            </Text>
            <Text style={styles.statSubVal}>
              {stats.outgoingInternalBags.toLocaleString("en-IN")} bags (internal)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Stock Summary</Text>
        <View style={styles.sectionRule} />
      </View>
      <SummaryTable matrix={stockSummary} sizeColumns={sizeColumns} />

      <View style={styles.sectionHeaderRow} break>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Incoming Details</Text>
        <View style={styles.sectionRule} />
      </View>
      <View style={styles.ledgerTableSection}>
        <LedgerTable
          data={incomingLedger}
          sizeColumns={sizeColumns}
          footerLabel="Total"
          footerSizeTotals={incomingFooterSizes}
          closingBalance={incomingClosingBalance}
          showStockFilter={showStockFilter}
          showCustomMarka={showCustomMarka}
        />
      </View>

      <View style={[styles.sectionHeaderRow, styles.outgoingSectionHeader]}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Outgoing Details</Text>
        <View style={styles.sectionRule} />
      </View>
      <LedgerTable
        data={outgoingLedger}
        sizeColumns={sizeColumns}
        footerLabel="Closing Balance"
        footerSizeTotals={outgoingFooterSizes}
        closingBalance={outgoingClosingBalance}
        showStockFilter={showStockFilter}
        showCustomMarka={showCustomMarka}
      />

      <View style={styles.footer} fixed>
        <View style={styles.footerRule} />
        <View style={styles.footerRow}>
          <View style={styles.footerColLeft}>
            <Text style={styles.footerDisclosure}>Computer-generated ledger.</Text>
          </View>
          <View style={styles.footerColCenter}>
            <View style={styles.footerBrand}>
              {coldopLogo ? (
                <Image src={coldopLogo} style={styles.footerBrandLogo} />
              ) : null}
              <Text style={styles.footerBrandText}>
                Powered by <Text style={styles.footerBrandHighlight}>Coldop</Text>
              </Text>
            </View>
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
    </Page>
  );
}

export default function FarmerStockLedgerReport(props: FarmerStockLedgerReportProps) {
  return (
    <Document
      author="Coldop"
      keywords="cold storage, stock ledger, farmer report"
      subject="Farmer Stock Ledger"
      title={`${props.coldStorageName} - Ledger`}
    >
      <FarmerStockLedgerPage {...props} />
    </Document>
  );
}
