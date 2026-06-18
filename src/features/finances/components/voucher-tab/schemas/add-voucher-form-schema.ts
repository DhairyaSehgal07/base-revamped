import * as z from "zod"

export const addVoucherFormSchema = z
  .object({
    date: z.string().datetime("Select a valid date"),
    debitLedger: z.string().min(1, "Select a debit ledger"),
    creditLedger: z.string().min(1, "Select a credit ledger"),
    amount: z.string().trim().min(1, "Amount is required"),
    narration: z.string(),
  })
  .superRefine((values, ctx) => {
    const parsedAmount = Number(values.amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount greater than zero",
        path: ["amount"],
      })
    }

    if (
      values.debitLedger &&
      values.creditLedger &&
      values.debitLedger === values.creditLedger
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Debit and credit ledgers must be different",
        path: ["creditLedger"],
      })
    }
  })

export type AddVoucherFormValues = z.infer<typeof addVoucherFormSchema>

export function parseVoucherAmount(value: string): number {
  return Number(value)
}
