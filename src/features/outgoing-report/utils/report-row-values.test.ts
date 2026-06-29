import { describe, expect, it } from "vitest"

import type { OutgoingGatePassReportRecord } from "@/features/outgoing-report/api/types"

import {
  formatOutgoingReportVarietyBreakdownForExport,
  getOutgoingReportSizeQuantityDetailLines,
  getOutgoingReportVarietyBreakdown,
  hasMultipleOutgoingReportVarieties,
} from "./report-row-values"

const farmerLink = {
  _id: "link-1",
  name: "Farmer",
  accountNumber: 42,
  address: "Addr",
  mobileNumber: "9999999999",
}

function createMultiVarietyPass(): OutgoingGatePassReportRecord {
  return {
    _id: "outgoing-1",
    gatePassNo: 202,
    date: "2026-01-02",
    variety: "Atlantic",
    farmerStorageLinkId: farmerLink,
    totalBags: 45,
    orderDetails: [
      {
        size: "Ration",
        quantityAvailable: 80,
        quantityIssued: 20,
        location: { chamber: "1", floor: "1", row: "A" },
      },
      {
        size: "Ration",
        quantityAvailable: 50,
        quantityIssued: 15,
        location: { chamber: "2", floor: "1", row: "B" },
      },
      {
        size: "Goli",
        quantityAvailable: 10,
        quantityIssued: 10,
        location: { chamber: "2", floor: "1", row: "C" },
      },
    ],
    incomingGatePassSnapshots: [
      {
        _id: "incoming-1",
        gatePassNo: 101,
        variety: "Atlantic",
        bagSizes: [
          {
            name: "Ration",
            initialQuantity: 100,
            currentQuantity: 80,
            type: "RECEIPT",
            quantityIssued: 0,
            location: { chamber: "1", floor: "1", row: "A" },
          },
        ],
      },
      {
        _id: "incoming-2",
        gatePassNo: 102,
        variety: "Chipsona",
        bagSizes: [
          {
            name: "Ration",
            initialQuantity: 50,
            currentQuantity: 50,
            type: "RECEIPT",
            quantityIssued: 0,
            location: { chamber: "2", floor: "1", row: "B" },
          },
          {
            name: "Goli",
            initialQuantity: 10,
            currentQuantity: 10,
            type: "RECEIPT",
            quantityIssued: 0,
            location: { chamber: "2", floor: "1", row: "C" },
          },
        ],
      },
    ],
  }
}

describe("outgoing report variety breakdown helpers", () => {
  const multiVarietyPass = createMultiVarietyPass()

  it("returns per-variety totals from order line resolution", () => {
    expect(getOutgoingReportVarietyBreakdown(multiVarietyPass)).toEqual([
      { variety: "Atlantic", quantity: 20 },
      { variety: "Chipsona", quantity: 25 },
    ])
  })

  it("detects multiple varieties even when entry.variety is set", () => {
    expect(hasMultipleOutgoingReportVarieties(multiVarietyPass)).toBe(true)
  })

  it("returns size detail lines with location and variety", () => {
    expect(
      getOutgoingReportSizeQuantityDetailLines(multiVarietyPass, "Ration"),
    ).toEqual([
      {
        variety: "Atlantic",
        quantity: 20,
        locationLabel: "1/1/A",
      },
      {
        variety: "Chipsona",
        quantity: 15,
        locationLabel: "2/1/B",
      },
    ])
  })

  it("formats multi-variety breakdown for export", () => {
    expect(formatOutgoingReportVarietyBreakdownForExport(multiVarietyPass)).toBe(
      "Atlantic (20)\nChipsona (25)",
    )
  })
})
