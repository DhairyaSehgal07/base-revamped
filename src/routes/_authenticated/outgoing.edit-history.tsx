import { createFileRoute } from '@tanstack/react-router'
import OutgoingEditHistoryPage from '@/features/outgoing-edit-history'

export const Route = createFileRoute('/_authenticated/outgoing/edit-history')({
  component: OutgoingEditHistoryPage,
})
