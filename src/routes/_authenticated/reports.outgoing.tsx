import { createFileRoute } from '@tanstack/react-router';
import { ReportPlaceholder } from '@/features/reports/report-placeholder';

export const Route = createFileRoute('/_authenticated/reports/outgoing')({
  component: () => <ReportPlaceholder title="Outgoing Reports" />,
});
