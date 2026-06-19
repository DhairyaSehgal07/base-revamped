import { useMemo } from "react"
import { useForm } from "@tanstack/react-form"

import {
  buildAddFarmerPayload,
  createAddFarmerFormSchema,
  createDefaultAddFarmerValues,
} from "@/features/people/schemas/add-farmer-form-schema"
import type { FarmerStorageLink } from "@/features/people/types"
import {
  getNextAccountNumber,
  getUsedAccountNumbers,
  getUsedMobileNumbers,
} from "@/features/people/utils/farmer-account-numbers"

type UseAddFarmerFormOptions = {
  links: FarmerStorageLink[]
  onSubmit: (
    payload: ReturnType<typeof buildAddFarmerPayload>,
  ) => Promise<void>
}

export function useAddFarmerForm({ links, onSubmit }: UseAddFarmerFormOptions) {
  const nextAccountNumber = useMemo(
    () => getNextAccountNumber(getUsedAccountNumbers(links)),
    [links],
  )

  const formSchema = useMemo(
    () =>
      createAddFarmerFormSchema({
        getUsedAccountNumbers: () => getUsedAccountNumbers(links),
        getUsedMobileNumbers: () => getUsedMobileNumbers(links),
      }),
    [links],
  )

  return useForm({
    defaultValues: createDefaultAddFarmerValues(nextAccountNumber),
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = formSchema.parse(value)
      await onSubmit(buildAddFarmerPayload(parsed))
    },
  })
}

export type AddFarmerFormApi = ReturnType<typeof useAddFarmerForm>
