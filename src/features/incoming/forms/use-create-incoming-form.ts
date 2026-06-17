import { useForm } from "@tanstack/react-form"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import {
  createDefaultIncomingQuantities,
  incomingFormSchema,
  type IncomingFormValues,
} from "@/features/incoming/schemas/incoming-form-schema"
import {
  defaultSubmitMeta,
  type IncomingSubmitMeta,
} from "@/features/incoming/types"

export type { IncomingFormValues }

type UseCreateIncomingFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateIncomingForm(
  options: UseCreateIncomingFormOptions = {}
) {
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      farmerIncomingLinkId: "",
      createdBy: userId,
      variety: "",
      category: "",
      date: todayIso,
      quantities: createDefaultIncomingQuantities(),
      remarks: "",
    },
    validators: {
      onChange: incomingFormSchema,
      onSubmit: incomingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = incomingFormSchema.parse(value)

      if ((meta as IncomingSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      console.log(parsed)
      options.onCloseReview?.()
    },
  })
}

export type CreateIncomingFormApi = ReturnType<typeof useCreateIncomingForm>
