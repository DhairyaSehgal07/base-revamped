import { describe, expect, it } from "vitest"

import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from "@/features/daybook/types"

import { buildFarmerReportSections } from "./build-farmer-report-sections"
import { buildFarmerStockLedgerPdfData } from "./build-farmer-stock-ledger-pdf-data"

const farmerLink = {
  _id: "link-1",
  name: "Tirlok Singh",
  accountNumber: 42,
  address: "Village Raipur",
  mobileNumber: "9876543210",
}

const EMPTY_SUMMARIES = {
  totalIncomingBags: 0,
  totalOutgoingBags: 0,
  totalInternallyTransferredIncomingBags: 0,
  totalInternallyTransferredOutgoingBags: 0,
}

function createIncomingPass(
  overrides: Partial<IncomingDaybookEntry> = {},
): IncomingDaybookEntry {
  return {
    _id: "incoming-1",
    gatePassNo: 101,
    date: "2026-01-01",
    createdAt: "2026-01-01T10:00:00.000Z",
    type: "RECEIPT",
    variety: "Atlantic",
    status: "active",
    farmerStorageLinkId: farmerLink,
    bagSizes: [
      {
        name: "Ration",
        initialQuantity: 100,
        currentQuantity: 80,
        location: { chamber: "1", floor: "1", row: "A" },
      },
      {
        name: "Seed",
        initialQuantity: 50,
        currentQuantity: 50,
        location: { chamber: "1", floor: "2", row: "B" },
      },
    ],
    ...overrides,
  }
}

function createOutgoingPass(
  overrides: Partial<OutgoingDaybookEntry> = {},
): OutgoingDaybookEntry {
  return {
    _id: "outgoing-1",
    gatePassNo: 202,
    date: "2026-01-02",
    createdAt: "2026-01-02T10:00:00.000Z",
    type: "DELIVERY",
    variety: "Atlantic",
    farmerStorageLinkId: farmerLink,
    orderDetails: [
      {
        size: "Ration",
        quantityAvailable: 80,
        quantityIssued: 30,
        location: { chamber: "1", floor: "1", row: "A" },
      },
    ],
    ...overrides,
  }
}

const commodities = [
  {
    name: "Potato",
    varieties: ["Atlantic"],
    sizes: ["Ration", "Seed", "Goli"],
  },
]

const search = {
  name: "Tirlok Singh",
  address: "Village Raipur",
  mobileNumber: "9876543210",
  accountNumber: 42,
}

describe("buildFarmerStockLedgerPdfData", () => {
  it("builds stock summary using current quantity only", () => {
    const entries: DaybookEntry[] = [createIncomingPass()]
    const sections = buildFarmerReportSections(entries)

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: {
        ...EMPTY_SUMMARIES,
        totalIncomingBags: 150,
      },
      commodities,
      search,
      generatedAt: new Date("2026-06-23T10:00:00.000Z"),
    })

    expect(result.stockSummary.grandTotal).toBe(130)
    expect(result.stockSummary.rows[0]?.bySize.Ration).toBe(80)
    expect(result.stockSummary.rows[0]?.bySize.Seed).toBe(50)
  })

  it("maps opening balance row for outgoing ledger", () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({ gatePassNo: 1 }),
      createOutgoingPass({ gatePassNo: 2 }),
    ]
    const sections = buildFarmerReportSections(entries)

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: {
        ...EMPTY_SUMMARIES,
        totalIncomingBags: 150,
        totalOutgoingBags: 30,
      },
      commodities,
      search,
    })

    expect(result.outgoingLedger[0]?.isOpeningBalance).toBe(true)
    expect(result.outgoingLedger[0]?.date).toBe("Opening Balance")
    expect(result.outgoingLedger[0]?.sizes.Ration).toEqual({
      type: "plain",
      value: "100",
    })
    expect(result.outgoingClosingBalance).toBe(120)
  })

  it("orders size columns from commodity preferences", () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({
        bagSizes: [
          {
            name: "Goli",
            initialQuantity: 10,
            currentQuantity: 10,
            location: { chamber: "1", floor: "1", row: "A" },
          },
          {
            name: "Ration",
            initialQuantity: 20,
            currentQuantity: 20,
            location: { chamber: "1", floor: "1", row: "A" },
          },
        ],
      }),
    ]
    const sections = buildFarmerReportSections(entries)

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 30 },
      commodities,
      search,
    })

    expect(result.sizeColumns.slice(0, 2)).toEqual(["Ration", "Goli"])
    expect(result.sizeColumns).toContain("Goli")
    expect(result.sizeColumns).not.toContain("Seed")
  })

  it("uses running totals for incoming ledger rows", () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({
        _id: "incoming-a",
        gatePassNo: 1,
        bagSizes: [
          {
            name: "Ration",
            initialQuantity: 100,
            currentQuantity: 100,
            location: { chamber: "1", floor: "1", row: "A" },
          },
        ],
      }),
      createIncomingPass({
        _id: "incoming-b",
        gatePassNo: 2,
        createdAt: "2026-02-01T10:00:00.000Z",
        bagSizes: [
          {
            name: "Ration",
            initialQuantity: 50,
            currentQuantity: 50,
            location: { chamber: "1", floor: "1", row: "A" },
          },
        ],
      }),
    ]
    const sections = buildFarmerReportSections(entries)

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 150 },
      commodities,
      search,
    })

    expect(result.incomingLedger.map((row) => row.total)).toEqual(["100", "150"])
    expect(result.incomingClosingBalance).toBe(150)
  })

  it("maps stock filter and custom marka when enabled", () => {
    const entries: DaybookEntry[] = [
      createIncomingPass({
        stockFilter: "Own Stock",
        customMarka: "TS-42",
      }),
    ]
    const sections = buildFarmerReportSections(entries)

    const result = buildFarmerStockLedgerPdfData({
      entries,
      sections,
      summaries: { ...EMPTY_SUMMARIES, totalIncomingBags: 150 },
      commodities,
      search,
      showStockFilter: true,
      showCustomMarka: true,
    })

    expect(result.showStockFilter).toBe(true)
    expect(result.showCustomMarka).toBe(true)
    expect(result.incomingLedger[0]?.stockFilter).toBe("Own Stock")
    expect(result.incomingLedger[0]?.customMarka).toBe("TS-42")
  })
})
