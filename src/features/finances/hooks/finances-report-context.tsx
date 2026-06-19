import { createContext, useContext } from "react"

import type { PeriodFilter } from "@/features/finances/shared/constants"

type FinancesReportContextValue = {
  period: PeriodFilter
}

export const FinancesReportContext =
  createContext<FinancesReportContextValue | null>(null)

export function useFinancesReportPeriod(): PeriodFilter {
  const context = useContext(FinancesReportContext)
  return context?.period ?? "this_month"
}
