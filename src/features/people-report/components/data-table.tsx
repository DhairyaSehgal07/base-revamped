import * as React from "react"
import {
  type Cell,
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type GroupingState,
  type OnChangeFn,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  FarmerReportSectionMode,
  FarmerReportTableRow,
} from "@/features/people-report/utils/build-farmer-report-sections"
import { cn } from "@/lib/utils"

import { farmerReportSortingFns } from "./columns"
import { DataTableColumnHeader } from "./data-table-column-header"
import { ReportTotalsFooter } from "./report-totals-footer"
import {
  getCellClassName,
  getColumnAlign,
  getHeadClassName,
  OPENING_BALANCE_ROW_CLASS,
  TABLE_GRID_CLASS,
} from "./table-styles"

interface DataTableProps {
  columns: ColumnDef<FarmerReportTableRow>[]
  data: FarmerReportTableRow[]
  grouping: GroupingState
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  sectionMode?: FarmerReportSectionMode
  flush?: boolean
}

export const FARMER_REPORT_DEFAULT_SORTING: SortingState = [
  { id: "date", desc: false },
]

function renderGroupedCell(
  row: Row<FarmerReportTableRow>,
  cell: Cell<FarmerReportTableRow, unknown>,
) {
  const canExpand = row.getCanExpand()

  return (
    <button
      type="button"
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 text-left font-medium text-foreground",
        canExpand ? "cursor-pointer" : "cursor-default",
      )}
      onClick={row.getToggleExpandedHandler()}
      disabled={!canExpand}
    >
      <ChevronRight
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          row.getIsExpanded() && "rotate-90",
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </span>
      <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
        ({row.subRows.length})
      </span>
    </button>
  )
}

function renderDataCell(
  row: Row<FarmerReportTableRow>,
  cell: Cell<FarmerReportTableRow, unknown>,
) {
  if (cell.getIsGrouped()) {
    return renderGroupedCell(row, cell)
  }

  if (cell.getIsAggregated()) {
    return flexRender(
      cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
      cell.getContext(),
    )
  }

  if (cell.getIsPlaceholder()) {
    return null
  }

  return flexRender(cell.column.columnDef.cell, cell.getContext())
}

function getTableRowClassName(row: Row<FarmerReportTableRow>) {
  if (row.original.kind === "opening-balance") {
    return OPENING_BALANCE_ROW_CLASS
  }

  return cn(
    "border-0",
    row.getIsGrouped()
      ? "bg-muted/50 font-medium hover:bg-muted/50"
      : "even:bg-muted/20 hover:bg-muted/40",
  )
}

function renderTableRow(
  row: Row<FarmerReportTableRow>,
  isGroupingActive: boolean,
) {
  return (
    <TableRow key={row.id} className={getTableRowClassName(row)}>
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell
          key={cell.id}
          className={cn(
            getCellClassName(cell.column.columnDef.meta),
            isGroupingActive && row.depth > 0 && "bg-background/40",
          )}
          style={
            isGroupingActive && row.depth > 0 && cellIndex === 0
              ? { paddingLeft: `${row.depth * 1.25 + 0.75}rem` }
              : undefined
          }
        >
          {renderDataCell(row, cell)}
        </TableCell>
      ))}
    </TableRow>
  )
}

function renderPinnedTableRow(
  row: Row<FarmerReportTableRow>,
  visibleColumns: Column<FarmerReportTableRow, unknown>[],
) {
  return (
    <TableRow key={row.id} className={getTableRowClassName(row)}>
      {visibleColumns.map((column, columnIndex) => {
        const cell = row
          .getVisibleCells()
          .find((visibleCell) => visibleCell.column.id === column.id)

        if (!cell) {
          return (
            <TableCell
              key={column.id}
              className={getCellClassName(column.columnDef.meta)}
            />
          )
        }

        let content: React.ReactNode

        if (row.original.kind === "opening-balance") {
          if (columnIndex === 0) {
            content = (
              <span className="font-semibold text-primary">Opening Balance</span>
            )
          } else if (column.id === "date") {
            content = <span className="text-muted-foreground">—</span>
          } else {
            content = renderDataCell(row, cell)
          }
        } else {
          content = renderDataCell(row, cell)
        }

        return (
          <TableCell
            key={cell.id}
            className={getCellClassName(column.columnDef.meta)}
          >
            {content}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

export function DataTable({
  columns,
  data,
  grouping,
  sorting,
  onSortingChange,
  sectionMode = "incoming",
  flush = false,
}: DataTableProps) {
  const [expanded, setExpanded] = React.useState<true | Record<string, boolean>>(
    true,
  )
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false)
  const [isFooterElevated, setIsFooterElevated] = React.useState(false)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setExpanded(grouping.length > 0 ? true : {})
  }, [grouping])

  const isGroupingActive = grouping.length > 0

  const pinnedRows = React.useMemo(
    () =>
      isGroupingActive
        ? data.filter((row) => row.kind === "opening-balance")
        : [],
    [data, isGroupingActive],
  )

  const groupableData = React.useMemo(
    () =>
      isGroupingActive
        ? data.filter((row) => row.kind !== "opening-balance")
        : data,
    [data, isGroupingActive],
  )

  const table = useReactTable({
    data: groupableData,
    columns,
    state: {
      sorting,
      grouping,
      expanded,
    },
    onSortingChange,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    sortingFns: farmerReportSortingFns,
    enableSortingRemoval: true,
    sortDescFirst: false,
    groupedColumnMode: "reorder",
  })

  const pinnedTable = useReactTable({
    data: pinnedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const pinnedTableRows = pinnedTable.getRowModel().rows
  const rows = table.getRowModel().rows
  const visibleColumns = table.getVisibleLeafColumns()
  const hasDataRows = pinnedTableRows.length > 0 || rows.length > 0

  const handleTableScroll = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    setIsHeaderScrolled(el.scrollTop > 0)

    const hasOverflow = el.scrollHeight > el.clientHeight
    const isAtBottom =
      Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight
    setIsFooterElevated(hasOverflow && !isAtBottom)
  }, [])

  React.useEffect(() => {
    handleTableScroll()
  }, [handleTableScroll, rows.length, columns.length])

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden",
        flush ? "rounded-none border-0" : "rounded-lg border border-border",
      )}
    >
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              "sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent",
              isHeaderScrolled && "shadow-[0_1px_0_0] shadow-border/80",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const align = getColumnAlign(meta)
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "group/head",
                        getHeadClassName(meta, isHeaderScrolled),
                      )}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <DataTableColumnHeader
                          column={header.column}
                          sorted={sorted}
                          align={align}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </DataTableColumnHeader>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-0">
            {hasDataRows ? (
              <>
                {pinnedTableRows.map((row) =>
                  renderPinnedTableRow(row, visibleColumns),
                )}
                {rows.map((row) => renderTableRow(row, isGroupingActive))}
              </>
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No gate passes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {hasDataRows ? (
            <ReportTotalsFooter
              table={table}
              rows={data}
              sectionMode={sectionMode}
              isFooterElevated={isFooterElevated}
            />
          ) : null}
        </Table>
      </div>
    </div>
  )
}
