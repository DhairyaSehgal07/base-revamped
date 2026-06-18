import { useForm } from "@tanstack/react-form"

import {
  addLedgerFormSchema,
  parseOpeningBalance,
} from "../schemas/add-ledger-form-schema"

type UseAddLedgerFormOptions = {
  onSuccess?: () => void
}

export function useAddLedgerForm({ onSuccess }: UseAddLedgerFormOptions = {}) {
  return useForm({
    defaultValues: {
      name: "",
      type: "",
      subType: "",
      category: "",
      openingBalance: "",
    },
    validators: {
      onChange: addLedgerFormSchema,
      onSubmit: addLedgerFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = addLedgerFormSchema.parse(value)

      console.log({
        ...parsed,
        openingBalance: parseOpeningBalance(parsed.openingBalance),
      })

      onSuccess?.()
    },
  })
}

export type AddLedgerFormApi = ReturnType<typeof useAddLedgerForm>
