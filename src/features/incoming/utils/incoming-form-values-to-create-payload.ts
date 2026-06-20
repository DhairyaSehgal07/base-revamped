import type { IncomingQuantityRow } from "@/features/incoming/schemas/incoming-quantities-schema"
import {
  hasCompleteIncomingQuantityLocation,
} from "@/features/incoming/schemas/incoming-quantities-schema"
import type { CreateIncomingGatePassPayload } from "@/features/incoming/types/api"
import type { IncomingFormValues } from "@/features/incoming/types"

export function getActiveIncomingQuantityRows(
  quantities: IncomingQuantityRow[]
): IncomingQuantityRow[] {
  return quantities.filter(
    (row) => (row.qty ?? 0) > 0 && hasCompleteIncomingQuantityLocation(row)
  )
}

type BuildCreateIncomingGatePassPayloadOptions = {
  showFinances: boolean
  costPerBag?: number
  coldStorageId?: string
  createdById?: string
}

export function buildCreateIncomingGatePassPayload(
  values: IncomingFormValues,
  {
    showFinances,
    costPerBag,
    coldStorageId,
    createdById,
  }: BuildCreateIncomingGatePassPayloadOptions
): CreateIncomingGatePassPayload {
  const activeRows = getActiveIncomingQuantityRows(values.quantities)

  if (activeRows.length === 0) {
    throw new Error("Enter at least one bag quantity with chamber, floor, and row.")
  }

  const totalBags = activeRows.reduce((sum, row) => sum + (row.qty ?? 0), 0)

  const payload: CreateIncomingGatePassPayload = {
    farmerStorageLinkId: values.farmerIncomingLinkId,
    date: values.date,
    variety: values.variety,
    bagSizes: activeRows.map((row) => ({
      name: row.size,
      initialQuantity: row.qty ?? 0,
      currentQuantity: row.qty ?? 0,
      location: {
        chamber: row.chamber.trim(),
        floor: row.floor.trim(),
        row: row.row.trim(),
      },
    })),
  }

  if (values.manualGatePassNumber != null) {
    payload.manualParchiNumber = String(values.manualGatePassNumber)
  }

  if (values.stockFilter.trim()) {
    payload.stockFilter = values.stockFilter.trim()
  }

  if (values.customMarka.trim()) {
    payload.customMarka = values.customMarka.trim()
  }

  if (values.remarks.trim()) {
    payload.remarks = values.remarks.trim()
  }

  if (createdById) {
    payload.createdById = createdById
  }

  if (coldStorageId) {
    payload.coldStorageId = coldStorageId
  }

  if (showFinances) {
    if (typeof costPerBag !== "number" || costPerBag <= 0) {
      throw new Error(
        "Selected farmer has no valid cost per bag. Update the farmer account or disable finances."
      )
    }

    const amount = totalBags * costPerBag

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0 when finances are enabled.")
    }

    payload.amount = amount
  }

  return payload
}
