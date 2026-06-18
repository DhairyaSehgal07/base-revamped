import { z } from "zod"

export const FINANCES_TAB_VALUES = [
  "vouchers",
  "ledgers",
  "financial-statements",
  "closing-balances",
] as const

export const financesTabSchema = z.enum(FINANCES_TAB_VALUES)

export const financesSearchSchema = z.object({
  tab: financesTabSchema.catch("vouchers"),
})

export type FinancesTab = z.infer<typeof financesTabSchema>
