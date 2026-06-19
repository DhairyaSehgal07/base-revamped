import { createFileRoute } from "@tanstack/react-router"

import { PersonDetailPage } from "@/features/people/components/person-detail-page"
import { personDetailSearchSchema } from "@/features/people/search"

export const Route = createFileRoute("/_authenticated/people/$id")({
  validateSearch: personDetailSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const search = Route.useSearch()

  return <PersonDetailPage linkId={id} search={search} />
}
