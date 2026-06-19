import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { LedgerStatementPage } from "@/features/finances/components/ledger-statement"
import { financesPeriodSchema } from "@/features/finances/search"
import { DEFAULT_FINANCES_PERIOD } from "@/features/finances/shared/constants"

const ledgerDetailSearchSchema = z.object({
  period: financesPeriodSchema.catch(DEFAULT_FINANCES_PERIOD),
})

export const Route = createFileRoute("/_authenticated/finances/ledgers/$id")({
  validateSearch: ledgerDetailSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { period } = Route.useSearch()

  return <LedgerStatementPage ledgerId={id} period={period} />
}
