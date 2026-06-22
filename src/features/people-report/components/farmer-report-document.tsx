import { FarmerReportGatePassesSection } from "@/features/people-report/components/farmer-report-gate-passes-section"

type FarmerReportDocumentProps = {
  linkId: string
}

export function FarmerReportDocument({ linkId }: FarmerReportDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <FarmerReportGatePassesSection linkId={linkId} />
    </div>
  )
}
