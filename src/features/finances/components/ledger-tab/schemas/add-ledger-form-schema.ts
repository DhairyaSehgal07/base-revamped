import * as z from "zod"

import {
  getSubTypesForType,
  LEDGER_TYPES,
} from "../constants/ledger-options"

export const addLedgerFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    type: z.string().min(1, "Select a type"),
    subType: z.string().min(1, "Select a sub type"),
    category: z.string().min(1, "Select a category"),
    openingBalance: z.string(),
  })
  .superRefine((values, ctx) => {
    if (
      values.type &&
      !LEDGER_TYPES.includes(values.type as (typeof LEDGER_TYPES)[number])
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select a type",
        path: ["type"],
      })
    }

    if (values.type && values.subType) {
      const validSubTypes = getSubTypesForType(values.type)
      if (!validSubTypes.includes(values.subType)) {
        ctx.addIssue({
          code: "custom",
          message: "Select a sub type",
          path: ["subType"],
        })
      }
    }

    if (values.openingBalance.trim() === "") {
      return
    }

    const parsed = Number(values.openingBalance)
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount",
        path: ["openingBalance"],
      })
    }
  })

export type AddLedgerFormValues = z.infer<typeof addLedgerFormSchema>

export function parseOpeningBalance(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
