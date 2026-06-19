import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { LedgerStatementPage } from "@/features/finances/components/ledger-statement"
import { financesPeriodSchema } from "@/features/finances/search"

const ledgerDetailSearchSchema = z.object({
  period: financesPeriodSchema,
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
