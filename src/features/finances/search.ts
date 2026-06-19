import { z } from "zod"

import {
  DEFAULT_FINANCES_PERIOD,
  PERIOD_FILTER_VALUES,
  type PeriodFilter,
} from "@/features/finances/shared/constants"

export const FINANCES_TAB_VALUES = [
  "vouchers",
  "ledgers",
  "financial-statements",
  "closing-balances",
] as const

export const financesTabSchema = z.enum(FINANCES_TAB_VALUES)

export const financesPeriodSchema = z.enum(PERIOD_FILTER_VALUES)

export const financesSearchSchema = z.object({
  tab: financesTabSchema.catch("vouchers"),
  period: financesPeriodSchema.catch(DEFAULT_FINANCES_PERIOD),
})

export type FinancesTab = z.infer<typeof financesTabSchema>
export type FinancesPeriod = PeriodFilter
