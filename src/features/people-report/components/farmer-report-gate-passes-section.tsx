import { memo, useMemo, useState, useCallback, type Dispatch, type SetStateAction } from "react"
import { FileText } from "lucide-react"
import type { GroupingState, SortingState } from "@tanstack/react-table"

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
import {
  shouldShowCustomMarka,
  shouldShowStockFilter,
} from "@/features/incoming/utils/incoming-preferences"
import {
  getFarmerReportBagSizeSignature,
  getFarmerReportColumnsForSizes,
} from "@/features/people-report/components/columns"
import { DataTable, FARMER_REPORT_DEFAULT_SORTING } from "@/features/people-report/components/data-table"
import {
  FarmerReportHeaderSkeleton,
  FarmerReportTableSkeleton,
} from "@/features/people-report/components/farmer-report-table-skeleton"
import {
  ReportHeaderCard,
  ReportToolbar,
} from "@/features/people-report/components/report-toolbar"
import { buildFarmerReportSections } from "@/features/people-report/utils/build-farmer-report-sections"
import type { BuildFarmerStockLedgerExcelDataInput } from "@/features/people-report/components/farmer-stock-ledger-excel-button"
import type { BuildFarmerStockLedgerPdfDataInput } from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import type { PersonDetailSearch } from "@/features/people/search"
import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  toggleFarmerReportGrouping,
  type FarmerReportGroupColumnId,
} from "@/features/people-report/utils/report-grouping"
import type { ColumnDef } from "@tanstack/react-table"

type FarmerReportGatePassesSectionProps = {
  linkId: string
  search: PersonDetailSearch
}

type ReportTableSectionProps = {
  title: string
  subtitle: string
  rowCount: number
  columns: ColumnDef<FarmerReportTableRow>[]
  data: FarmerReportTableRow[]
  grouping: GroupingState
  sorting: SortingState
  onSortingChange: Dispatch<SetStateAction<SortingState>>
  sectionMode?: "incoming" | "outgoing"
}

const ReportTableSection = memo(function ReportTableSection({
  title,
  subtitle,
  rowCount,
  columns,
  data,
  grouping,
  sorting,
  onSortingChange,
  sectionMode = "incoming",
}: ReportTableSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary" className="h-7 w-fit tabular-nums font-normal">
          {rowCount} row{rowCount === 1 ? "" : "s"}
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={data}
        grouping={grouping}
        sorting={sorting}
        onSortingChange={onSortingChange}
        sectionMode={sectionMode}
        flush
      />
    </div>
  )
})

export function FarmerReportGatePassesSection({
  linkId,
  search,
}: FarmerReportGatePassesSectionProps) {
  const commodities = usePreferencesStore((state) => state.preferences?.commodities ?? [])
  const customMarkaPreference = usePreferencesStore(
    (state) => state.preferences?.customMarka,
  )
  const stockFilterPreference = usePreferencesStore(
    (state) => state.preferences?.stockFilter,
  )
  const showCustomMarka = shouldShowCustomMarka(customMarkaPreference)
  const showStockFilter = shouldShowStockFilter(stockFilterPreference)

  const [appliedFrom, setAppliedFrom] = useState<string | undefined>()
  const [appliedTo, setAppliedTo] = useState<string | undefined>()
  const [grouping, setGrouping] = useState<GroupingState>([])
  const [incomingSorting, setIncomingSorting] = useState<SortingState>(
    FARMER_REPORT_DEFAULT_SORTING,
  )
  const [outgoingSorting, setOutgoingSorting] = useState<SortingState>(
    FARMER_REPORT_DEFAULT_SORTING,
  )

  const activeGrouping = useMemo(() => {
    if (showStockFilter) return grouping

    return grouping.filter(
      (id) => id !== FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter,
    )
  }, [grouping, showStockFilter])

  const handleToggleGrouping = useCallback(
    (columnId: FarmerReportGroupColumnId) => {
      setGrouping((current) => toggleFarmerReportGrouping(current, columnId))
    },
    [],
  )

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

  const bagSizeSignature = useMemo(
    () => getFarmerReportBagSizeSignature(displayedRows, commodities),
    [displayedRows, commodities],
  )

  const columns = useMemo(
    () =>
      getFarmerReportColumnsForSizes(
        bagSizeSignature ? bagSizeSignature.split("\0") : [],
        showCustomMarka,
        showStockFilter,
      ),
    [bagSizeSignature, showCustomMarka, showStockFilter],
  )

  const outgoingGatePassCount = useMemo(
    () => sections.outgoing.filter((row) => row.kind === "gate-pass").length,
    [sections.outgoing],
  )

  const hasAnyRows =
    sections.incoming.length > 0 || sections.outgoing.length > 0

  const getPdfBuildInput = useCallback((): BuildFarmerStockLedgerPdfDataInput | null => {
    if (!hasAnyRows) return null

    return {
      entries: displayedRows,
      sections,
      summaries: gatePasses.summaries,
      commodities,
      search,
      showStockFilter,
      showCustomMarka,
      grouping: activeGrouping,
      incomingSorting,
      outgoingSorting,
    }
  }, [
    activeGrouping,
    commodities,
    displayedRows,
    gatePasses.summaries,
    hasAnyRows,
    incomingSorting,
    outgoingSorting,
    search,
    sections,
    showCustomMarka,
    showStockFilter,
  ])

  const getExcelBuildInput = useCallback((): BuildFarmerStockLedgerExcelDataInput | null => {
    const pdfInput = getPdfBuildInput()
    if (!pdfInput) return null

    return {
      ...pdfInput,
      appliedFrom,
      appliedTo,
    }
  }, [appliedFrom, appliedTo, getPdfBuildInput])

  const handleApplyDates = useCallback((from?: string, to?: string) => {
    setAppliedFrom(from)
    setAppliedTo(to)
  }, [])

  const handleResetDates = useCallback(() => {
    setAppliedFrom(undefined)
    setAppliedTo(undefined)
  }, [])

  const handleRefresh = useCallback(() => {
    void gatePasses.refetch()
  }, [gatePasses])

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
              grouping={activeGrouping}
              showStockFilterGrouping={showStockFilter}
              onToggleGrouping={handleToggleGrouping}
              isLoading={gatePasses.isLoading}
              isFetching={gatePasses.isFetching}
              onRefresh={handleRefresh}
              getPdfBuildInput={getPdfBuildInput}
              getExcelBuildInput={getExcelBuildInput}
              pdfDisabled={gatePasses.isLoading || gatePasses.isFetching || !hasAnyRows}
              excelDisabled={gatePasses.isLoading || gatePasses.isFetching || !hasAnyRows}
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
                  grouping={activeGrouping}
                  sorting={incomingSorting}
                  onSortingChange={setIncomingSorting}
                  sectionMode="incoming"
                />
              ) : null}

              {sections.outgoing.length > 0 ? (
                <ReportTableSection
                  title="Outgoing gate passes"
                  subtitle="Deliveries and internal transfers for the selected date range."
                  rowCount={outgoingGatePassCount}
                  columns={columns}
                  data={sections.outgoing}
                  grouping={activeGrouping}
                  sorting={outgoingSorting}
                  onSortingChange={setOutgoingSorting}
                  sectionMode="outgoing"
                />
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  )
}
