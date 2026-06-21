import type { OutgoingDaybookEntry } from "@/features/daybook/types"
import type { OutgoingEditFormValues } from "@/features/outgoing/schemas/outgoing-edit-form-schema"

function parseManualGatePassNumber(
  value: string | number | undefined
): number | undefined {
  if (value === undefined || value === "") return undefined
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function normalizeToIsoDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

export function outgoingDaybookEntryToEditFormValues(
  entry: OutgoingDaybookEntry
): OutgoingEditFormValues {
  return {
    manualGatePassNumber: parseManualGatePassNumber(entry.manualParchiNumber),
    date: normalizeToIsoDateTime(entry.date),
    from: entry.from?.trim() ?? "",
    to: entry.to?.trim() ?? "",
    truckNumber: (entry.truckNumber ?? "").trim().toUpperCase(),
    remarks: entry.remarks?.trim() ?? "",
  }
}
