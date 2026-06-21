import { describe, expect, it } from "vitest"

import type { OutgoingEditFormValues } from "@/features/outgoing/schemas/outgoing-edit-form-schema"
import { buildUpdateOutgoingGatePassPayload } from "@/features/outgoing/utils/outgoing-edit-form-values-to-update-payload"

const baseline: OutgoingEditFormValues = {
  manualGatePassNumber: 56,
  date: "2026-06-21T10:30:00.000Z",
  from: "Cold Storage A",
  to: "Mandi Delhi",
  truckNumber: "HR-26-AB-1234",
  remarks: "Original remarks",
}

describe("buildUpdateOutgoingGatePassPayload", () => {
  it("returns null when values are unchanged", () => {
    expect(buildUpdateOutgoingGatePassPayload(baseline, baseline)).toBeNull()
  })

  it('omits remarks when cleared before create', () => {
    expect(
      buildUpdateOutgoingGatePassPayload(
        { ...baseline, remarks: '' },
        baseline,
      ),
    ).toEqual({ remarks: '' })
  })

  it('sends only changed fields for a remarks-only partial update', () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      remarks: "Corrected remarks only",
    }

    expect(buildUpdateOutgoingGatePassPayload(current, baseline)).toEqual({
      remarks: "Corrected remarks only",
    })
  })

  it("maps manualGatePassNumber to manualParchiNumber", () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      manualGatePassNumber: 99,
    }

    expect(buildUpdateOutgoingGatePassPayload(current, baseline)).toEqual({
      manualParchiNumber: 99,
    })
  })

  it("uppercases truckNumber in the payload", () => {
    const current: OutgoingEditFormValues = {
      ...baseline,
      truckNumber: "hr-99-xy-0001",
    }

    expect(buildUpdateOutgoingGatePassPayload(current, baseline)).toEqual({
      truckNumber: "HR-99-XY-0001",
    })
  })
})
