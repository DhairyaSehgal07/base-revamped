import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/finances')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/finances"!</div>
}
