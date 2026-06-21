import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { incomingGatePassesByFarmerLinkQueryKey } from "@/features/incoming/api/use-incoming-gate-passes-by-farmer-link"
import type { IncomingGatePassRecord } from "@/features/incoming/types/api"
import { outgoingFormSchema } from "@/features/outgoing/schemas/outgoing-form-schema"
import type { OutgoingFormValues } from "@/features/outgoing/types"
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
import { useNextGatePassNumber } from "@/hooks/use-next-gate-pass-number"

export type { OutgoingFormValues }

type UseCreateOutgoingFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
  onResetComboboxState?: () => void
  onSubmitConfirmed?: (
    values: OutgoingFormValues,
    items: TransferStockItem[],
    passes: StorageGatePass[]
  ) => Promise<void>
}

export function useCreateOutgoingForm(options: UseCreateOutgoingFormOptions = {}) {
  const queryClient = useQueryClient()
  const [todayIso] = useState(() => new Date().toISOString())

  const {
    nextNumber: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useNextGatePassNumber("outgoing")

  const isGatePassNumberReady =
    nextVoucherNumber != null &&
    !isLoadingVoucherNumber &&
    !isVoucherNumberError

  const form = useForm({
    defaultValues: {
      farmerStorageLinkId: "",
      date: todayIso,
      manualGatePassNumber: undefined as number | undefined,
      from: "",
      to: "",
      truckNumber: "",
      remarks: "",
      allocations: {} as Record<string, number>,
    },
    validators: {
      onChange: outgoingFormSchema,
      onSubmit: outgoingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = outgoingFormSchema.parse(value)

      if ((meta as OutgoingSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      const records =
        queryClient.getQueryData<IncomingGatePassRecord[]>(
          incomingGatePassesByFarmerLinkQueryKey(parsed.farmerStorageLinkId)
        ) ?? []
      const passes = incomingGatePassesToStorageGatePasses(
        records,
        parsed.farmerStorageLinkId
      )
      const items = buildTransferItems(parsed.allocations, passes)

      if (!options.onSubmitConfirmed) {
        throw new Error("Submit handler is not configured.")
      }

      await options.onSubmitConfirmed(parsed, items, passes)
      options.onCloseReview?.()
    },
  })

  return {
    form,
    nextVoucherNumber,
    isLoadingVoucherNumber,
    isVoucherNumberError,
    isGatePassNumberReady,
  }
}

export type CreateOutgoingFormApi = ReturnType<typeof useCreateOutgoingForm>
