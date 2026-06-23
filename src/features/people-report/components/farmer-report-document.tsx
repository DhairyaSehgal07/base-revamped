import { FarmerReportGatePassesSection } from "@/features/people-report/components/farmer-report-gate-passes-section"
import type { PersonDetailSearch } from "@/features/people/search"

type FarmerReportDocumentProps = {
  linkId: string
  search: PersonDetailSearch
}

export function FarmerReportDocument({
  linkId,
  search,
}: FarmerReportDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <FarmerReportGatePassesSection linkId={linkId} search={search} />
    </div>
  )
}
