import { describe, expect, it } from "vitest"

import type { Row } from "@tanstack/react-table"

import type { IncomingGatePassReportRecord } from "@/features/incoming-report/api/types"

import {
  computeIncomingReportFooterTotals,
  exportCellValueToDisplay,
  formatExportCellValue,
} from "./export-cell-value"

function createRow(
  overrides: Partial<IncomingGatePassReportRecord> = {},
): IncomingGatePassReportRecord {
  return {
    _id: "row-1",
    gatePassNo: 55,
    date: "2026-06-29T02:44:10.373Z",
    type: "RECEIPT",
    variety: "Atlantic",
    status: "OPEN",
    bagSizes: [],
    initialTotal: 0,
    currentTotal: 0,
    farmerStorageLinkId: {
      _id: "farmer-1",
      name: "lokesh",
      accountNumber: 8,
      address: "mandi road",
      mobileNumber: "7757041279",
    },
    ...overrides,
  }
}

describe("formatExportCellValue size columns", () => {
  it("shows location below quantity for a single bag with location", () => {
    const row = createRow({
      bagSizes: [
        {
          name: "Jumbo",
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: "C1", floor: "F2", row: "R3" },
        },
      ],
    })

    const cell = formatExportCellValue("size-Jumbo", 500, row, "current")

    expect(cell).toEqual({
      kind: "text",
      value: "500\n(C1-F2-R3)",
    })
    expect(exportCellValueToDisplay(cell)).toBe("500\n(C1-F2-R3)")
  })

  it("keeps plain numbers when no location is present", () => {
    const row = createRow({
      bagSizes: [
        {
          name: "Jumbo",
          initialQuantity: 500,
          currentQuantity: 500,
          location: { chamber: "", floor: "", row: "" },
        },
      ],
    })

    const cell = formatExportCellValue("size-Jumbo", 500, row, "current")

    expect(cell).toEqual({
      kind: "number",
      value: 500,
      format: "integer",
    })
  })

  it("stacks multiple bags with location below each quantity", () => {
    const row = createRow({
      bagSizes: [
        {
          name: "Jumbo",
          initialQuantity: 500,
          currentQuantity: 400,
          location: { chamber: "C1", floor: "F1", row: "R1" },
        },
        {
          name: "Jumbo",
          initialQuantity: 200,
          currentQuantity: 200,
          location: { chamber: "C2", floor: "F2", row: "R2" },
        },
      ],
    })

    const cell = formatExportCellValue("size-Jumbo", 600, row, "current")

    expect(cell).toEqual({
      kind: "text",
      value: "400\n(C1-F1-R1)\n\n200\n(C2-F2-R2)",
    })
  })
})

describe("computeIncomingReportFooterTotals", () => {
  it("aggregates totals in a single pass", () => {
    const rows = [
      {
        original: createRow({
          initialTotal: 700,
          currentTotal: 600,
          bagSizes: [
            {
              name: "Jumbo",
              initialQuantity: 500,
              currentQuantity: 400,
              location: { chamber: "C1", floor: "F1", row: "R1" },
            },
            {
              name: "Medium",
              initialQuantity: 200,
              currentQuantity: 200,
              location: { chamber: "C2", floor: "F2", row: "R2" },
            },
          ],
        }),
      },
      {
        original: createRow({
          initialTotal: 100,
          currentTotal: 100,
          bagSizes: [
            {
              name: "Jumbo",
              initialQuantity: 100,
              currentQuantity: 100,
              location: { chamber: "C3", floor: "F3", row: "R3" },
            },
          ],
        }),
      },
    ] as Row<IncomingGatePassReportRecord>[]

    const totals = computeIncomingReportFooterTotals(rows, "current")

    expect(totals.get("totalBags")).toEqual({
      kind: "number",
      value: 700,
      format: "integer",
    })
    expect(totals.get("size-Jumbo")).toEqual({
      kind: "number",
      value: 500,
      format: "integer",
    })
    expect(totals.get("size-Medium")).toEqual({
      kind: "number",
      value: 200,
      format: "integer",
    })
  })
})
