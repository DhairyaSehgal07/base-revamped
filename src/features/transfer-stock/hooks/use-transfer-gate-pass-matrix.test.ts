import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useTransferGatePassMatrix } from "@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix"
import type { StorageGatePass } from "@/features/transfer-stock/types/storage-gate-pass"

vi.mock("@/features/auth/store/use-preferences-store", () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) =>
    selector({ preferences: { commodities: [] } }),
}))

function makePass(id: string, variety: string, gatePassNo: number): StorageGatePass {
  return {
    _id: id,
    farmerStorageLinkId: "674a1b2c3d4e5f6789012345",
    accountNumber: 101,
    gatePassNo,
    date: "2026-06-01T00:00:00.000Z",
    variety,
    storageCategory: "RECEIPT",
    bagSizes: [
      {
        size: "50 kg",
        currentQuantity: 40,
        initialQuantity: 40,
        bagType: "LENO",
        chamber: "A",
        floor: "1",
        row: "R1",
      },
    ],
    remarks: "",
  }
}

describe("useTransferGatePassMatrix", () => {
  it("does not require variety selection in multi-optional mode", () => {
    const passes = [
      makePass("pass-chipsona", "Chipsona", 10),
      makePass("pass-kufri", "Kufri Jyoti", 11),
    ]

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: "multi-optional",
      })
    )

    expect(result.current.needsVarietySelection).toBe(false)
    expect(result.current.hasFilteredData).toBe(true)
    expect(result.current.displayGroups.flatMap((group) => group.passes)).toHaveLength(
      2
    )
  })

  it("requires variety selection in single-required mode when multiple varieties exist", () => {
    const passes = [
      makePass("pass-chipsona", "Chipsona", 10),
      makePass("pass-kufri", "Kufri Jyoti", 11),
    ]

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: "single-required",
      })
    )

    expect(result.current.needsVarietySelection).toBe(true)
    expect(result.current.hasFilteredData).toBe(false)
  })

  it("filters by selected varieties in multi-optional mode", () => {
    const passes = [
      makePass("pass-chipsona", "Chipsona", 10),
      makePass("pass-kufri", "Kufri Jyoti", 11),
    ]

    const { result } = renderHook(() =>
      useTransferGatePassMatrix({
        allPasses: passes,
        allocations: {},
        onAllocationsChange: vi.fn(),
        varietyFilterMode: "multi-optional",
      })
    )

    act(() => {
      result.current.setVarietyVisibility(new Set(["Chipsona"]))
    })

    const visiblePasses = result.current.displayGroups.flatMap(
      (group) => group.passes
    )
    expect(visiblePasses).toHaveLength(1)
    expect(visiblePasses[0]?.variety).toBe("Chipsona")
  })
})
