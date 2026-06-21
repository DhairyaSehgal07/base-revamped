import type { TransferStockFormValues } from "@/features/transfer-stock/schemas/transfer-stock-form-schema"
import type { CreateTransferStockPayload } from "@/features/transfer-stock/types/api"
import type { TransferStockItem } from "@/features/transfer-stock/types/storage-gate-pass"

export function buildCreateTransferStockPayload(
  values: TransferStockFormValues,
  items: TransferStockItem[]
): CreateTransferStockPayload {
  const remarks = values.remarks.trim()

  const customMarka = values.customMarka.trim()

  return {
    fromFarmerStorageLinkId: values.fromFarmerStorageLinkId,
    toFarmerStorageLinkId: values.toFarmerStorageLinkId,
    date: values.date,
    items: items.map((item) => ({
      incomingGatePassId: item.storageGatePassId,
      bagSize: item.bagSize,
      quantity: item.quantity,
      location: item.location,
    })),
    ...(customMarka ? { customMarka } : {}),
    ...(remarks ? { remarks } : {}),
  }
}
