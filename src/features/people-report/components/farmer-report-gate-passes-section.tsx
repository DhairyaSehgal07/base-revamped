import { useMemo, useState } from "react"
import { FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { usePreferencesStore } from "@/features/auth/store/use-preferences-store"
import { useFarmerGatePasses } from "@/features/people/api/use-farmer-gate-passes"
import { shouldShowCustomMarka } from "@/features/incoming/utils/incoming-preferences"
import { getFarmerReportColumns } from "@/features/people-report/components/columns"
import { DataTable } from "@/features/people-report/components/data-table"
import {
  FarmerReportHeaderSkeleton,
  FarmerReportTableSkeleton,
} from "@/features/people-report/components/farmer-report-table-skeleton"
import {
  ReportHeaderCard,
  ReportToolbar,
} from "@/features/people-report/components/report-toolbar"
import { buildFarmerReportSections } from "@/features/people-report/utils/build-farmer-report-sections"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import type { ColumnDef } from "@tanstack/react-table"

type FarmerReportGatePassesSectionProps = {
  linkId: string
}

type ReportTableSectionProps = {
  title: string
  subtitle: string
  rowCount: number
  columns: ColumnDef<FarmerReportTableRow>[]
  data: FarmerReportTableRow[]
}

function ReportTableSection({
  title,
  subtitle,
  rowCount,
  columns,
  data,
}: ReportTableSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary" className="w-fit tabular-nums font-normal">
          {rowCount} row{rowCount === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="p-4 sm:p-5">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}

export function FarmerReportGatePassesSection({
  linkId,
}: FarmerReportGatePassesSectionProps) {
  const preferences = usePreferencesStore((state) => state.preferences)
  const commodities = preferences?.commodities ?? []
  const showCustomMarka = shouldShowCustomMarka(preferences?.customMarka)

  const [appliedFrom, setAppliedFrom] = useState<string | undefined>()
  const [appliedTo, setAppliedTo] = useState<string | undefined>()

  const apiFilters = useMemo(
    () => ({
      type: "all" as const,
      sortBy: "latest" as const,
      ...(appliedFrom ? { from: appliedFrom } : {}),
      ...(appliedTo ? { to: appliedTo } : {}),
    }),
    [appliedFrom, appliedTo],
  )

  const gatePasses = useFarmerGatePasses(linkId, apiFilters)
  const displayedRows = gatePasses.entries

  const sections = useMemo(
    () => buildFarmerReportSections(displayedRows),
    [displayedRows],
  )

  const columns = useMemo(
    () => getFarmerReportColumns(displayedRows, commodities, showCustomMarka),
    [displayedRows, commodities, showCustomMarka],
  )

  const handleApplyDates = (from?: string, to?: string) => {
    setAppliedFrom(from)
    setAppliedTo(to)
  }

  const handleResetDates = () => {
    setAppliedFrom(undefined)
    setAppliedTo(undefined)
  }

  const handleRefresh = () => {
    void gatePasses.refetch()
  }

  const hasAnyRows =
    sections.incoming.length > 0 || sections.outgoing.length > 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {gatePasses.isLoading ? (
        <>
          <FarmerReportHeaderSkeleton />
          <FarmerReportTableSkeleton />
        </>
      ) : (
        <>
          <ReportHeaderCard rowCount={displayedRows.length}>
            <ReportToolbar
              appliedFrom={appliedFrom}
              appliedTo={appliedTo}
              onApplyDates={handleApplyDates}
              onResetDates={handleResetDates}
              rowCount={displayedRows.length}
              isLoading={gatePasses.isLoading}
              isFetching={gatePasses.isFetching}
              onRefresh={handleRefresh}
            />
          </ReportHeaderCard>

          {gatePasses.isError ? (
            <Empty className="rounded-xl border bg-muted/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>Could not load gate passes</EmptyTitle>
                <EmptyDescription>
                  {gatePasses.error instanceof Error
                    ? gatePasses.error.message
                    : "Something went wrong while fetching gate passes."}
                </EmptyDescription>
              </EmptyHeader>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={gatePasses.isFetching}
              >
                Try again
              </Button>
            </Empty>
          ) : !hasAnyRows ? (
            <Empty className="rounded-xl border bg-muted/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No gate passes found</EmptyTitle>
                <EmptyDescription>
                  {gatePasses.emptyMessage ?? "Try changing the date range."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {sections.incoming.length > 0 ? (
                <ReportTableSection
                  title="Incoming gate passes"
                  subtitle="Normal and internally transferred receipts for the selected date range."
                  rowCount={sections.incoming.length}
                  columns={columns}
                  data={sections.incoming}
                />
              ) : null}

              {sections.outgoing.length > 0 ? (
                <ReportTableSection
                  title="Outgoing gate passes"
                  subtitle="Deliveries and internal transfers for the selected date range."
                  rowCount={
                    sections.outgoing.filter((row) => row.kind === "gate-pass")
                      .length
                  }
                  columns={columns}
                  data={sections.outgoing}
                />
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  )
}