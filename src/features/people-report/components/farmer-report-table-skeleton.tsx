import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

function ReportTableCardSkeleton({ titleWidth = "w-44" }: { titleWidth?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className={`h-5 ${titleWidth}`} />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="min-w-0 overflow-hidden rounded-lg border border-border">
          <div className="max-h-[min(70vh,42rem)] overflow-hidden">
            <div className="border-b border-border bg-muted/50 px-3 py-3">
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-20 shrink-0" />
                ))}
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex gap-3 border-b border-border/35 px-3 py-3 even:bg-muted/20"
              >
                {Array.from({ length: 6 }).map((__, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-16 shrink-0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FarmerReportTableSkeleton() {
  return (
    <>
      <ReportTableCardSkeleton titleWidth="w-44" />
      <ReportTableCardSkeleton titleWidth="w-44" />
    </>
  )
}

export function FarmerReportHeaderSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Separator />
      <div className="space-y-3 bg-muted/20 p-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  )
}
