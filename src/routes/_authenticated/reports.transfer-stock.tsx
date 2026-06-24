import { createFileRoute } from '@tanstack/react-router';
import { ReportPlaceholder } from '@/features/reports/report-placeholder';

export const Route = createFileRoute('/_authenticated/reports/transfer-stock')({
  component: () => <ReportPlaceholder title="Transfer Stock Reports" />,
});
