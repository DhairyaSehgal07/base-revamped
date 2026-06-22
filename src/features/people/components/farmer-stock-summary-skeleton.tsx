import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

type FarmerStockSummarySkeletonProps = {
  embedded?: boolean
}

export function FarmerStockSummarySkeleton({
  embedded = false,
}: FarmerStockSummarySkeletonProps) {
  return (
    <div
      className={
        embedded
          ? "flex w-full flex-col gap-3"
          : "flex w-full flex-col gap-4"
      }
    >
      <div className="space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-0 bg-muted/20">
          <div className="flex gap-6 px-4 pt-4 pb-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-6 px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <Skeleton className="h-11 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
