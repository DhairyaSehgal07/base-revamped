import { useMemo } from "react"

import type {
  StorageGatePass,
  TransferStockItem,
} from "@/features/transfer-stock/types/storage-gate-pass"
import { findPassAndSlot } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"

type AllocationReviewByVarietyProps = {
  items: TransferStockItem[]
  passes: StorageGatePass[]
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
    <div className="space-y-4">
      {groups.map(([variety, groupItems]) => (
        <div key={variety} className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {variety}
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/50">
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
                {groupItems.map((item, index) => (
                  <tr
                    key={`${item.storageGatePassId}-${item.bagSize}-${item.bagIndex}-${index}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-mono text-sm tabular-nums">
                      #{item.gatePassNo}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{item.bagSize}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {formatLocation(item.location)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {item.quantity.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
