import { useCallback, useEffect, useRef, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatQuantity } from "@/features/daybook/utils/format"
import {
  getCellClassName,
  getFooterClassName,
  getHeadClassName,
  stockSummaryAccentBgClass,
  stockSummaryAccentTextClass,
  TABLE_GRID_CLASS,
} from "@/features/people/components/farmer-stock-summary-table-styles"
import type {
  StockQuantityMode,
  StockSummaryMatrix,
} from "@/features/people/utils/build-farmer-stock-summary"
import { cn } from "@/lib/utils"

type AnalyticsStockSummaryTableProps = {
  matrix: StockSummaryMatrix
  quantityMode: StockQuantityMode
}

export function AnalyticsStockSummaryTable({
  matrix,
  quantityMode,
}: AnalyticsStockSummaryTableProps) {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { sizeColumns, rows, footerBySize, grandTotal } = matrix
  const hasRows = rows.length > 0
  const accentTextClass = stockSummaryAccentTextClass(quantityMode)
  const accentBgClass = stockSummaryAccentBgClass(quantityMode)

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    setIsHeaderScrolled(el.scrollTop > 0)
  }, [])

  useEffect(() => {
    handleTableScroll()
  }, [handleTableScroll, rows.length])

  if (!hasRows) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-border px-4 text-sm text-muted-foreground">
        No stock found.
      </div>
    )
  }

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
            <TableRow className="border-0">
              <TableHead
                className={getHeadClassName({ sticky: true }, isHeaderScrolled)}
              >
                Varieties
              </TableHead>

              {sizeColumns.map((size) => (
                <TableHead
                  key={size}
                  className={getHeadClassName(
                    { numeric: true, align: "right" },
                    isHeaderScrolled,
                  )}
                >
                  {size}
                </TableHead>
              ))}

              <TableHead
                className={getHeadClassName(
                  { numeric: true, align: "right" },
                  isHeaderScrolled,
                )}
              >
                Total
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-0">
            {rows.map((row) => (
              <TableRow
                key={row.variety}
                className="border-0 even:bg-muted/20 hover:bg-muted/40"
              >
                <TableCell
                  className={getCellClassName({ sticky: true })}
                  title={row.variety}
                >
                  <span className="block max-w-40 truncate font-medium sm:max-w-none">
                    {row.variety}
                  </span>
                </TableCell>

                {sizeColumns.map((size) => {
                  const value = row.bySize[size] ?? 0

                  return (
                    <TableCell
                      key={`${row.variety}-${size}`}
                      className={cn(
                        getCellClassName({ numeric: true, align: "right" }),
                        value > 0 && accentTextClass,
                      )}
                    >
                      {formatQuantity(value)}
                    </TableCell>
                  )
                })}

                <TableCell
                  className={cn(
                    getCellClassName({ numeric: true, align: "right" }),
                    accentTextClass,
                  )}
                >
                  {formatQuantity(row.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="bg-muted/30 [&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell className={getFooterClassName({ sticky: true })}>
                Bag Total
              </TableCell>

              {sizeColumns.map((size) => (
                <TableCell
                  key={`footer-${size}`}
                  className={getFooterClassName({
                    numeric: true,
                    align: "right",
                  })}
                >
                  {formatQuantity(footerBySize[size] ?? 0)}
                </TableCell>
              ))}

              <TableCell
                className={cn(
                  getFooterClassName({ numeric: true, align: "right" }),
                  accentBgClass,
                  accentTextClass,
                )}
              >
                {formatQuantity(grandTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
