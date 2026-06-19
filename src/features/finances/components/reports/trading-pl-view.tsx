import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TradingPlReport } from "@/features/finances/domain/types"
import { formatCurrency } from "@/features/finances/shared/format-currency"
import { cn } from "@/lib/utils"

type TradingPlViewProps = {
  report: TradingPlReport
}

export function TradingPlView({ report }: TradingPlViewProps) {
  const {
    openingStock,
    closingStock,
    purchaseTotal,
    salesTotal,
    grossProfit,
    pnlDebit,
    pnlCredit,
    tradingDebitTotal,
    tradingCreditTotal,
    debitTotal,
    creditTotal,
  } = report

  const maxRows = Math.max(pnlDebit.length, pnlCredit.length)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          Trading A/c and Profit & Loss A/c
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table className="w-full text-sm">
            <TableHeader className="border-b border-border bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                  Particulars
                </TableHead>
                <TableHead className="h-10 border-l border-dashed border-border px-3 text-right font-medium text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                  Particulars
                </TableHead>
                <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-y-2 border-border bg-muted/50 hover:bg-muted/50">
                <TableCell colSpan={4} className="py-2 text-center font-medium">
                  Trading Account
                </TableCell>
              </TableRow>

              {openingStock > 0 ? (
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5">Opening Stock</TableCell>
                  <TableCell className="border-l border-dashed border-border px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(openingStock)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5" />
                </TableRow>
              ) : null}

              <TableRow className="hover:bg-muted/50">
                <TableCell className="px-3 py-2.5">Purchases</TableCell>
                <TableCell className="border-l border-dashed border-border px-3 py-2.5 text-right tabular-nums">
                  {formatCurrency(purchaseTotal)}
                </TableCell>
                <TableCell className="px-3 py-2.5">Sales</TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {formatCurrency(salesTotal)}
                </TableCell>
              </TableRow>

              {closingStock > 0 ? (
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="border-l border-dashed border-border px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5">Closing Stock</TableCell>
                  <TableCell className="px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(closingStock)}
                  </TableCell>
                </TableRow>
              ) : null}

              {grossProfit >= 0 ? (
                <TableRow className="border-b border-border hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5 font-medium">Gross Profit</TableCell>
                  <TableCell className="border-l border-dashed border-border px-3 py-2.5 text-right font-medium tabular-nums text-primary">
                    {formatCurrency(grossProfit)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5" />
                </TableRow>
              ) : (
                <TableRow className="border-b border-border hover:bg-muted/50">
                  <TableCell className="px-3 py-2.5" />
                  <TableCell className="border-l border-dashed border-border px-3 py-2.5" />
                  <TableCell className="px-3 py-2.5 font-medium">Gross Loss</TableCell>
                  <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums text-destructive">
                    {formatCurrency(Math.abs(grossProfit))}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="border-t-2 border-border bg-muted/50 font-medium hover:bg-muted/50">
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="border-l border-dashed border-border px-3 py-3 text-right tabular-nums">
                  {formatCurrency(tradingDebitTotal)}
                </TableCell>
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(tradingCreditTotal)}
                </TableCell>
              </TableRow>

              <TableRow className="border-y-2 border-border bg-muted/50 hover:bg-muted/50">
                <TableCell colSpan={4} className="py-2 text-center font-medium">
                  Profit & Loss Account
                </TableCell>
              </TableRow>

              {Array.from({ length: maxRows }).map((_, index) => {
                const debit = pnlDebit[index]
                const credit = pnlCredit[index]
                return (
                  <TableRow
                    key={`pnl-${index}`}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <TableCell className="px-3 py-2.5 text-muted-foreground">
                      {debit?.label ?? "\u00A0"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border-l border-dashed border-border px-3 py-2.5 text-right tabular-nums",
                        debit?.highlight &&
                          (debit.isProfit ? "font-medium text-primary" : "font-medium text-destructive")
                      )}
                    >
                      {debit ? formatCurrency(debit.amount) : "\u00A0"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">
                      {credit?.label ?? "\u00A0"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        credit?.highlight &&
                          (credit.isProfit ? "font-medium text-primary" : "font-medium text-destructive")
                      )}
                    >
                      {credit ? formatCurrency(credit.amount) : "\u00A0"}
                    </TableCell>
                  </TableRow>
                )
              })}

              <TableRow className="border-t-2 border-border bg-muted/50 font-medium hover:bg-muted/50">
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="border-l border-dashed border-border px-3 py-3 text-right tabular-nums">
                  {formatCurrency(debitTotal)}
                </TableCell>
                <TableCell className="px-3 py-3">Total</TableCell>
                <TableCell className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(creditTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
