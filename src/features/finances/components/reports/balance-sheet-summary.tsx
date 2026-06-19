import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInr } from "@/features/finances/shared/format-currency"
import { cn } from "@/lib/utils"

type BalanceSheetSummaryProps = {
  totalAssets: number
  totalLiabilitiesAndEquity: number
  isBalanced: boolean
  className?: string
}

export function BalanceSheetSummary({
  totalAssets,
  totalLiabilitiesAndEquity,
  isBalanced,
  className,
}: BalanceSheetSummaryProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Balance Sheet Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="font-heading text-xl font-semibold tabular-nums text-foreground">
              {formatInr(totalAssets)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Total Liabilities & Equity
            </p>
            <p className="font-heading text-xl font-semibold tabular-nums text-foreground">
              {formatInr(totalLiabilitiesAndEquity)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Balance Sheet Status</p>
            <p
              className={cn(
                "font-heading text-xl font-semibold",
                isBalanced ? "text-primary" : "text-destructive"
              )}
            >
              {isBalanced ? "Balanced" : "Unbalanced"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
