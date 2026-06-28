import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"

import { incomingGatePassesByFarmerLinkQueryKey } from "@/features/incoming/api/use-incoming-gate-passes-by-farmer-link"
import type { IncomingGatePassRecord } from "@/features/incoming/types/api"
import { outgoingEditFormSchema } from "@/features/outgoing/schemas/outgoing-edit-form-schema"
import type { OutgoingEditFormValues } from "@/features/outgoing/schemas/outgoing-edit-form-schema"
import {
  defaultSubmitMeta,
  type OutgoingSubmitMeta,
} from "@/features/outgoing/types"
import type {
  StorageGatePass,
  TransferStockItem,
} from "@/features/transfer-stock/types/storage-gate-pass"
import { buildTransferItems } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { incomingGatePassesToStorageGatePasses } from "@/features/transfer-stock/utils/incoming-gate-pass-to-storage-gate-pass"

type UseEditOutgoingGatePassFormOptions = {
  defaultValues: OutgoingEditFormValues
  resolveStoragePasses?: (farmerStorageLinkId: string) => StorageGatePass[]
  onOpenReview?: () => void
  onCloseReview?: () => void
  onSubmitConfirmed?: (
    values: OutgoingEditFormValues,
    items: TransferStockItem[],
    passes: StorageGatePass[]
  ) => Promise<void>
}

export function useEditOutgoingGatePassForm({
  defaultValues,
  resolveStoragePasses,
  onOpenReview,
  onCloseReview,
  onSubmitConfirmed,
}: UseEditOutgoingGatePassFormOptions) {
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues,
    validators: {
      onChange: outgoingEditFormSchema,
      onSubmit: outgoingEditFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = outgoingEditFormSchema.parse(value)

      if ((meta as OutgoingSubmitMeta).submitAction === "review") {
        onOpenReview?.()
        return
      }

      const records =
        queryClient.getQueryData<IncomingGatePassRecord[]>(
          incomingGatePassesByFarmerLinkQueryKey(parsed.farmerStorageLinkId)
        ) ?? []
      const passes =
        resolveStoragePasses?.(parsed.farmerStorageLinkId) ??
        incomingGatePassesToStorageGatePasses(
          records,
          parsed.farmerStorageLinkId
        )
      const items = buildTransferItems(parsed.allocations, passes)

      if (!onSubmitConfirmed) {
        throw new Error("Submit handler is not configured.")
      }

      await onSubmitConfirmed(parsed, items, passes)
      onCloseReview?.()
    },
  })

  return { form }
}

export type EditOutgoingGatePassFormApi = ReturnType<
  typeof useEditOutgoingGatePassForm
>
