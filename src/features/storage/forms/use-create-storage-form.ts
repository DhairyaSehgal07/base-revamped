import { useForm } from "@tanstack/react-form"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import {
  createDefaultStorageQuantities,
  storageFormSchema,
  type StorageFormValues,
} from "@/features/storage/schemas/storage-form-schema"
import { defaultSubmitMeta, type StorageSubmitMeta } from "@/features/storage/types"

export type { StorageFormValues }

type UseCreateStorageFormOptions = {
  onOpenReview?: () => void
  onCloseReview?: () => void
}

export function useCreateStorageForm(options: UseCreateStorageFormOptions = {}) {
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      farmerStorageLinkId: "",
      createdBy: userId,
      variety: "",
      category: "",
      date: todayIso,
      quantities: createDefaultStorageQuantities(),
      remarks: "",
    },
    validators: {
      onChange: storageFormSchema,
      onSubmit: storageFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = storageFormSchema.parse(value)

      if ((meta as StorageSubmitMeta).submitAction === "review") {
        options.onOpenReview?.()
        return
      }

      console.log(parsed)
      options.onCloseReview?.()
    },
  })
}

export type CreateStorageFormApi = ReturnType<typeof useCreateStorageForm>
