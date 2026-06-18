import { useForm } from "@tanstack/react-form"

import {
  addVoucherFormSchema,
  parseVoucherAmount,
} from "../schemas/add-voucher-form-schema"

type UseAddVoucherFormOptions = {
  onSuccess?: () => void
}

export function useAddVoucherForm({
  onSuccess,
}: UseAddVoucherFormOptions = {}) {
  const todayIso = new Date().toISOString()

  return useForm({
    defaultValues: {
      date: todayIso,
      debitLedger: "",
      creditLedger: "",
      amount: "",
      narration: "",
    },
    validators: {
      onChange: addVoucherFormSchema,
      onSubmit: addVoucherFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = addVoucherFormSchema.parse(value)

      console.log({
        ...parsed,
        amount: parseVoucherAmount(parsed.amount),
      })

      onSuccess?.()
    },
  })
}

export type AddVoucherFormApi = ReturnType<typeof useAddVoucherForm>
