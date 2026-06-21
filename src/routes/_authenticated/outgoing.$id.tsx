import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/outgoing/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/outgoing/$id"!</div>
}
