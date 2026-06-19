import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/features/finances/shared/format-currency"
import type { ReportRow } from "@/features/finances/shared/report-types"
import { cn } from "@/lib/utils"

type TwoColumnAmountTableProps = {
  leftTitle: string
  rightTitle: string
  leftRows: ReportRow[]
  rightRows: ReportRow[]
  leftTotalLabel?: string
  rightTotalLabel?: string
  leftTotal?: number
  rightTotal?: number
  className?: string
}

function AmountCell({
  row,
  className,
}: {
  row?: ReportRow
  className?: string
}) {
  return (
    <TableCell
      className={cn(
        "px-3 py-2.5 text-right tabular-nums",
        row?.isTotal && "font-medium text-foreground",
        row?.isProfit === true && "font-medium text-primary",
        row?.isProfit === false && "font-medium text-destructive",
        className
      )}
    >
      {row?.amount != null ? formatCurrency(row.amount) : "\u00A0"}
    </TableCell>
  )
}

function LabelCell({
  row,
  className,
}: {
  row?: ReportRow
  className?: string
}) {
  return (
    <TableCell
      className={cn(
        "px-3 py-2.5",
        row?.isHeader && "font-medium text-foreground",
        !row?.isHeader && "text-muted-foreground",
        className
      )}
    >
      {row?.label ?? "\u00A0"}
    </TableCell>
  )
}

export function TwoColumnAmountTable({
  leftTitle,
  rightTitle,
  leftRows,
  rightRows,
  leftTotalLabel = "Total",
  rightTotalLabel = "Total",
  leftTotal,
  rightTotal,
  className,
}: TwoColumnAmountTableProps) {
  const maxRows = Math.max(leftRows.length, rightRows.length)

  return (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-lg border border-border",
        className
      )}
    >
      <Table className="w-full text-sm">
        <TableHeader className="border-b border-border bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">
              {leftTitle}
            </TableHead>
            <TableHead className="h-10 border-l border-dashed border-border px-3 text-right font-medium text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">
              {rightTitle}
            </TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: maxRows }).map((_, index) => {
            const left = leftRows[index]
            const right = rightRows[index]
            return (
              <TableRow
                key={`${left?.label ?? "left"}-${right?.label ?? "right"}-${index}`}
                className="border-b border-border hover:bg-muted/50"
              >
                <LabelCell row={left} />
                <AmountCell
                  row={left}
                  className="border-l border-dashed border-border"
                />
                <LabelCell row={right} />
                <AmountCell row={right} />
              </TableRow>
            )
          })}
          {leftTotal != null && rightTotal != null ? (
            <TableRow className="border-t-2 border-border bg-muted/50 font-medium hover:bg-muted/50">
              <TableCell className="px-3 py-3">{leftTotalLabel}</TableCell>
              <TableCell className="border-l border-dashed border-border px-3 py-3 text-right tabular-nums">
                {formatCurrency(leftTotal)}
              </TableCell>
              <TableCell className="px-3 py-3">{rightTotalLabel}</TableCell>
              <TableCell className="px-3 py-3 text-right tabular-nums">
                {formatCurrency(rightTotal)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
