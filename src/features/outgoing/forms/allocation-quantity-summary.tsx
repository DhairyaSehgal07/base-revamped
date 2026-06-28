import { cn } from "@/lib/utils"

type AllocationQuantitySummaryProps = {
  previouslyIssued: number
  maxToIssue: number
  issuingNow: number
  className?: string
}

function formatQty(value: number) {
  return value.toLocaleString("en-IN")
}

export function AllocationQuantitySummary({
  previouslyIssued,
  maxToIssue,
  issuingNow,
  className,
}: AllocationQuantitySummaryProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/50 bg-card text-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="text-muted-foreground">Previously issued</span>
        <span className="tabular-nums text-muted-foreground">
          {formatQty(previouslyIssued)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="font-semibold text-foreground">Max to issue</span>
        <span className="font-semibold tabular-nums text-foreground">
          {formatQty(maxToIssue)}
        </span>
      </div>
      <div className="border-t border-border/50" />
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">
        <span className="text-muted-foreground">Issuing now</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatQty(issuingNow)}
        </span>
      </div>
    </div>
  )
}
