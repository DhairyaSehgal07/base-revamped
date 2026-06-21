import { useForm } from "@tanstack/react-form"

import {
  outgoingEditFormSchema,
  type OutgoingEditFormValues,
} from "@/features/outgoing/schemas/outgoing-edit-form-schema"

type UseEditOutgoingGatePassFormOptions = {
  defaultValues: OutgoingEditFormValues
  onSave: (values: OutgoingEditFormValues) => Promise<void>
}

export function useEditOutgoingGatePassForm({
  defaultValues,
  onSave,
}: UseEditOutgoingGatePassFormOptions) {
  return useForm({
    defaultValues,
    validators: {
      onChange: outgoingEditFormSchema,
      onSubmit: outgoingEditFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = outgoingEditFormSchema.parse(value)
      await onSave(parsed)
    },
  })
}

export type EditOutgoingGatePassFormApi = ReturnType<
  typeof useEditOutgoingGatePassForm
>
