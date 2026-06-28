import { useMemo } from "react"
import { Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type {
  StorageGatePass,
  TransferStockItem,
} from "@/features/transfer-stock/types/storage-gate-pass"
import { findPassAndSlot } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { cn } from "@/lib/utils"

type AllocationReviewByVarietyProps = {
  items: TransferStockItem[]
  passes: StorageGatePass[]
  variant?: "default" | "card"
}

type EnrichedItem = TransferStockItem & {
  variety: string
}

function formatLocation(location: TransferStockItem["location"]) {
  return `Ch ${location.chamber} · F ${location.floor} · R ${location.row}`
}

export function AllocationReviewByVariety({
  items,
  passes,
  variant = "default",
}: AllocationReviewByVarietyProps) {
  const groups = useMemo(() => {
    const enriched: EnrichedItem[] = items.map((item) => {
      const found = findPassAndSlot(
        passes,
        item.storageGatePassId,
        item.bagSize,
        item.bagIndex
      )
      return {
        ...item,
        variety: found?.pass.variety?.trim() || "—",
      }
    })

    const byVariety = new Map<string, EnrichedItem[]>()
    for (const item of enriched) {
      const list = byVariety.get(item.variety) ?? []
      list.push(item)
      byVariety.set(item.variety, list)
    }

    return [...byVariety.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [items, passes])

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">No allocations selected.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", variant === "card" && groups.length > 1 && "space-y-4")}>
      {groups.map(([variety, groupItems]) => {
        const groupTotal = groupItems.reduce((sum, item) => sum + item.quantity, 0)

        if (variant === "card") {
          return (
            <div
              key={variety}
              className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/25 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset">
                    <Package className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Variety
                    </p>
                    <h4
                      className="font-heading truncate text-sm font-semibold tracking-tight text-foreground"
                      title={variety}
                    >
                      {variety}
                    </h4>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 gap-1 bg-background/80 px-2.5 font-normal tabular-nums"
                >
                  {groupTotal.toLocaleString("en-IN")}
                  <span className="text-muted-foreground">bags</span>
                </Badge>
              </div>
              <AllocationLinesTable items={groupItems} />
              <div className="flex items-center justify-between border-t border-border/40 bg-muted/15 px-4 py-2.5">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {groupTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )
        }

        return (
          <div key={variety} className="space-y-2">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {variety}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <AllocationLinesTable items={groupItems} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AllocationLinesTable({ items }: { items: EnrichedItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border/40 bg-muted/30">
          <tr className="text-left">
            <th className="h-10 px-3 font-medium text-muted-foreground">
              Voucher
            </th>
            <th className="h-10 px-3 font-medium text-muted-foreground">
              Size
            </th>
            <th className="h-10 px-3 font-medium text-muted-foreground">
              Location
            </th>
            <th className="h-10 px-3 text-right font-medium text-muted-foreground">
              Qty
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.storageGatePassId}-${item.bagSize}-${item.bagIndex}-${index}`}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-3 py-2.5 font-mono text-sm tabular-nums text-foreground">
                #{item.gatePassNo.toLocaleString("en-IN")}
              </td>
              <td className="px-3 py-2.5 font-medium text-foreground">
                {item.bagSize}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {formatLocation(item.location)}
              </td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                {item.quantity.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
