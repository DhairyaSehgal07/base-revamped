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
import type { AnalyticsDistribution } from "@/features/analytics/utils/build-analytics-distribution"
import { cn } from "@/lib/utils"

type AnalyticsDistributionTableProps = {
  distribution: AnalyticsDistribution
  labelColumn: string
  className?: string
}

function formatShare(value: number): string {
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function AnalyticsDistributionTable({
  distribution,
  labelColumn,
  className,
}: AnalyticsDistributionTableProps) {
  const { items, total } = distribution

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-32 items-center justify-center rounded-lg border border-border px-4 text-sm text-muted-foreground",
          className,
        )}
      >
        No distribution data for this view.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                {labelColumn}
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Bags
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Share
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden
                    />
                    <span className="truncate font-medium" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatQuantity(item.bags)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                  {formatShare(item.share)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableCell className="px-3 py-2.5 font-semibold">Total</TableCell>
              <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                {formatQuantity(total)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-primary">
                100.0%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
