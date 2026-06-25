import { createFileRoute } from "@tanstack/react-router"

import { LedgerStatementPage } from "@/features/finances/components/ledger-statement"
import { ledgerStatementSearchSchema } from "@/features/finances/search"

export const Route = createFileRoute("/_authenticated/finances/ledgers/$id")({
  validateSearch: ledgerStatementSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const search = Route.useSearch()

  return <LedgerStatementPage ledgerId={id} search={search} />
}
