import { AnalyticsDistributionPanel } from "@/features/analytics/components/analytics-distribution-panel"
import type { AnalyticsDistribution } from "@/features/analytics/utils/build-analytics-distribution"
import type { StockQuantityMode } from "@/features/people/utils/build-farmer-stock-summary"

type AnalyticsVarietyDistributionProps = {
  distribution: AnalyticsDistribution
  quantityMode: StockQuantityMode
}

export function AnalyticsVarietyDistribution({
  distribution,
  quantityMode,
}: AnalyticsVarietyDistributionProps) {
  return (
    <AnalyticsDistributionPanel
      title="Variety distribution"
      labelColumn="Variety"
      distribution={distribution}
      quantityMode={quantityMode}
    />
  )
}
