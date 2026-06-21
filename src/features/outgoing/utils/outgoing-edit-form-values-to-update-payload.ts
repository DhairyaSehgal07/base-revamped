import type { OutgoingEditFormValues } from "@/features/outgoing/schemas/outgoing-edit-form-schema"
import type { UpdateOutgoingGatePassPayload } from "@/features/outgoing/types/api"
import { normalizeUppercase } from "@/lib/form-utils"

function normalizeIsoDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString()
}

function formatManualParchiNumber(value: number | undefined): number | undefined {
  return value != null ? value : undefined
}

export function buildUpdateOutgoingGatePassPayload(
  current: OutgoingEditFormValues,
  baseline: OutgoingEditFormValues
): UpdateOutgoingGatePassPayload | null {
  const payload: UpdateOutgoingGatePassPayload = {}

  if (
    normalizeIsoDateTime(current.date) !== normalizeIsoDateTime(baseline.date)
  ) {
    payload.date = current.date
  }

  const currentManual = formatManualParchiNumber(current.manualGatePassNumber)
  const baselineManual = formatManualParchiNumber(baseline.manualGatePassNumber)
  if (currentManual !== baselineManual) {
    payload.manualParchiNumber = currentManual
  }

  if (current.from.trim() !== baseline.from.trim()) {
    payload.from = current.from.trim()
  }

  if (current.to.trim() !== baseline.to.trim()) {
    payload.to = current.to.trim()
  }

  if (current.truckNumber.trim() !== baseline.truckNumber.trim()) {
    payload.truckNumber = normalizeUppercase(current.truckNumber.trim())
  }

  if (current.remarks.trim() !== baseline.remarks.trim()) {
    payload.remarks = current.remarks.trim()
  }

  return Object.keys(payload).length > 0 ? payload : null
}
