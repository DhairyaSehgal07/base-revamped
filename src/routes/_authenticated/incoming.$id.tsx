import { createFileRoute } from '@tanstack/react-router'
import CreateIncomingForm from '@/features/incoming/forms/create-incoming-form'

export const Route = createFileRoute('/_authenticated/incoming/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return (
    <>
      <div className="text-2xl">Incoming Gate Pass ID: {id}</div>
      <CreateIncomingForm />
    </>
  )
}
