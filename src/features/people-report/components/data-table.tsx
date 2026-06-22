import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FarmerReportTableRow } from "@/features/people-report/utils/build-farmer-report-sections"
import { cn } from "@/lib/utils"

import { DataTableColumnHeader } from "./data-table-column-header"
import { ReportTotalsFooter } from "./report-totals-footer"
import {
  getCellClassName,
  getColumnAlign,
  getHeadClassName,
  TABLE_GRID_CLASS,
} from "./table-styles"

interface DataTableProps {
  columns: ColumnDef<FarmerReportTableRow>[]
  data: FarmerReportTableRow[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false)
  const [isFooterElevated, setIsFooterElevated] = React.useState(false)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  })

  const rows = table.getRowModel().rows
  const hasDataRows = rows.length > 0

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
    <div className="min-w-0 overflow-hidden rounded-lg border border-border">
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

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "group/head",
                        getHeadClassName(meta, isHeaderScrolled),
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <DataTableColumnHeader
                          column={header.column}
                          sorted={false}
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
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-0",
                    row.original.kind === "opening-balance"
                      ? "bg-muted/80 font-semibold hover:bg-muted/80"
                      : "even:bg-muted/20 hover:bg-muted/40",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={getCellClassName(cell.column.columnDef.meta)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
              isFooterElevated={isFooterElevated}
            />
          ) : null}
        </Table>
      </div>
    </div>
  )
}
