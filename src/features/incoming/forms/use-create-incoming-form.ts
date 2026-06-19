import { useForm } from "@tanstack/react-form"
import { useRef } from "react"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import {
  createDefaultIncomingQuantities,
  createIncomingFormSchema,
  type IncomingFormSchemaConfig,
} from "@/features/incoming/schemas/incoming-form-schema"
import type { IncomingFormValues } from "@/features/incoming/types"
import {
  defaultSubmitMeta,
  type IncomingSubmitMeta,
} from "@/features/incoming/types"

export type { IncomingFormValues }

type UseCreateIncomingFormOptions = {
  schemaConfig: IncomingFormSchemaConfig
  initialCommodity?: string
  initialBagSizes?: string[]
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateIncomingForm({
  schemaConfig,
  initialCommodity = "",
  initialBagSizes = [],
  onOpenReview,
  onCloseReview,
}: UseCreateIncomingFormOptions) {
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const todayIso = new Date().toISOString()
  const schemaConfigRef = useRef(schemaConfig)
  schemaConfigRef.current = schemaConfig

  const validateForm = (value: IncomingFormValues) =>
    createIncomingFormSchema(schemaConfigRef.current).safeParse(value)

  return useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      farmerIncomingLinkId: "",
      createdBy: userId,
      commodity: initialCommodity,
      variety: "",
      stockFilter: "",
      customMarka: "",
      date: todayIso,
      quantities: createDefaultIncomingQuantities(initialBagSizes),
      remarks: "",
    },
    validators: {
      onChange: ({ value }) => {
        const result = validateForm(value)
        if (result.success) return undefined
        return result.error.issues.map((issue) => issue.message).join(", ")
      },
      onSubmit: ({ value }) => {
        const result = validateForm(value)
        if (result.success) return undefined
        return result.error.issues.map((issue) => issue.message).join(", ")
      },
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = createIncomingFormSchema(schemaConfigRef.current).parse(value)

      if ((meta as IncomingSubmitMeta).submitAction === "review") {
        onOpenReview?.()
        return
      }

      console.log(parsed)
      onCloseReview?.()
    },
  })
}

export type CreateIncomingFormApi = ReturnType<typeof useCreateIncomingForm>
