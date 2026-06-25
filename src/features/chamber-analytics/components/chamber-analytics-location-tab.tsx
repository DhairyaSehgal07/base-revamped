import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, RefreshCw, Warehouse } from "lucide-react"

import { useLocationAnalytics } from "../api/use-location-analytics"
import type { LocationAnalyticsQuantityTab } from "../types"
import { buildChamberSummaryCards } from "../utils/build-summary-cards"
import {
  findChamberByName,
  resolveChamberTabs,
} from "../utils/resolve-chamber-tabs"
import {
  ChamberAnalyticsSummaryCards,
  ChamberAnalyticsSummaryCardsSkeleton,
} from "./chamber-analytics-summary-cards"
import { ChamberDetailPanel, ChamberSelector } from "./chamber-detail-panel"
import { ChamberDistributionChart } from "./chamber-distribution-chart"

type ChamberAnalyticsLocationTabProps = {
  tab: LocationAnalyticsQuantityTab
  chamber: string | undefined
  floor: string
  enabled: boolean
  onChamberChange: (chamber: string) => void
  onFloorChange: (floor: string) => void
}

function LocationTabSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ChamberAnalyticsSummaryCardsSkeleton />
      <Skeleton className="h-[320px] w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function ChamberAnalyticsLocationTab({
  tab,
  chamber,
  floor,
  enabled,
  onChamberChange,
  onFloorChange,
}: ChamberAnalyticsLocationTabProps) {
  const analytics = useLocationAnalytics({ enabled })

  if (analytics.isLoading) {
    return <LocationTabSkeleton />
  }

  if (analytics.isError) {
    return (
      <Empty className="rounded-xl border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RefreshCw />
          </EmptyMedia>
          <EmptyTitle>Could not load location analytics</EmptyTitle>
          <EmptyDescription>
            {analytics.error instanceof Error
              ? analytics.error.message
              : "Something went wrong while fetching location data."}
          </EmptyDescription>
        </EmptyHeader>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void analytics.refetch()}
        >
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
      </Empty>
    )
  }

  const chambers = analytics.response?.data?.byLocation.chambers ?? []

  if (chambers.length === 0) {
    return (
      <Empty className="rounded-xl border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Warehouse />
          </EmptyMedia>
          <EmptyTitle>No location data</EmptyTitle>
          <EmptyDescription>
            There is no stock assigned to chambers or floors yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const cards = buildChamberSummaryCards(chambers, tab)
  const { activeChamber } = resolveChamberTabs(chambers, chamber)
  const selectedChamber = findChamberByName(chambers, activeChamber)

  return (
    <div className="flex flex-col gap-6">
      <ChamberAnalyticsSummaryCards cards={cards} />

      <ChamberDistributionChart chambers={chambers} tab={tab} />

      {activeChamber ? (
        <ChamberSelector
          chambers={chambers}
          activeChamber={activeChamber}
          onChamberChange={onChamberChange}
        />
      ) : null}

      {selectedChamber ? (
        <ChamberDetailPanel
          chamber={selectedChamber}
          tab={tab}
          floor={floor}
          onFloorChange={onFloorChange}
        />
      ) : (
        <Empty className="rounded-xl border border-dashed border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin />
            </EmptyMedia>
            <EmptyTitle>Select a chamber</EmptyTitle>
            <EmptyDescription>
              Choose a chamber above to view floor breakdown and gate passes.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
