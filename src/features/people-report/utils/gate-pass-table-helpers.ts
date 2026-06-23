import type { CommodityPreference } from "@/features/auth/types"
import type { DaybookEntry } from "@/features/daybook/types"
import {
  isIncomingDaybookEntry,
  isOutgoingDaybookEntry,
} from "@/features/daybook/types"
import { formatCompactLocation, locationKey } from "@/features/daybook/utils/format"
import {
  getMergedBagSizeOrder,
  sortSizeNamesByPreferenceOrder,
} from "@/features/incoming/utils/incoming-preferences"

export type GatePassSizeQuantityLine = {
  quantity: number
  locationLabel: string
}

export function collectUniqueBagSizes(rows: DaybookEntry[]): string[] {
  const sizes = new Set<string>()

  for (const row of rows) {
    if (isIncomingDaybookEntry(row)) {
      for (const bag of row.bagSizes ?? []) {
        const name = bag.name.trim()
        if (name) sizes.add(name)
      }
      continue
    }

    if (isOutgoingDaybookEntry(row)) {
      for (const line of row.orderDetails ?? []) {
        const size = line.size.trim()
        if (size) sizes.add(size)
      }
    }
  }

  return Array.from(sizes)
}

export function orderBagSizes(
  sizes: string[],
  commodities: CommodityPreference[],
): string[] {
  return sortSizeNamesByPreferenceOrder(sizes, getMergedBagSizeOrder(commodities))
}

export function getGatePassVariety(entry: DaybookEntry): string {
  if (isIncomingDaybookEntry(entry)) {
    return entry.variety?.trim() || "—"
  }

  if (isOutgoingDaybookEntry(entry)) {
    const variety =
      entry.variety?.trim() ||
      entry.incomingGatePassSnapshots?.[0]?.variety?.trim()
    return variety || "—"
  }

  return "—"
}

export function getGatePassSizeQuantity(
  entry: DaybookEntry,
  size: string,
): number | null {
  const normalizedSize = size.trim()
  if (!normalizedSize) return null

  if (isIncomingDaybookEntry(entry)) {
    let total = 0
    let found = false

    for (const bag of entry.bagSizes ?? []) {
      if (bag.name.trim() !== normalizedSize) continue
      found = true
      total += bag.initialQuantity
    }

    return found ? total : null
  }

  if (isOutgoingDaybookEntry(entry)) {
    let total = 0
    let found = false

    for (const line of entry.orderDetails ?? []) {
      if (line.size.trim() !== normalizedSize) continue
      found = true
      total += line.quantityIssued
    }

    return found ? total : null
  }

  return null
}

export function getGatePassSizeQuantityLines(
  entry: DaybookEntry,
  size: string,
): GatePassSizeQuantityLine[] {
  const normalizedSize = size.trim()
  if (!normalizedSize) return []

  const merged = new Map<string, GatePassSizeQuantityLine>()

  if (isIncomingDaybookEntry(entry)) {
    for (const bag of entry.bagSizes ?? []) {
      if (bag.name.trim() !== normalizedSize) continue

      const key = locationKey(bag.location)
      const existing = merged.get(key)

      if (existing) {
        existing.quantity += bag.initialQuantity
        continue
      }

      merged.set(key, {
        quantity: bag.initialQuantity,
        locationLabel: formatCompactLocation(bag.location),
      })
    }
  } else if (isOutgoingDaybookEntry(entry)) {
    for (const line of entry.orderDetails ?? []) {
      if (line.size.trim() !== normalizedSize) continue

      const key = locationKey(line.location)
      const existing = merged.get(key)

      if (existing) {
        existing.quantity += line.quantityIssued
        continue
      }

      merged.set(key, {
        quantity: line.quantityIssued,
        locationLabel: formatCompactLocation(line.location),
      })
    }
  }

  return Array.from(merged.values())
}

export function getGatePassTotalBags(entry: DaybookEntry): number {
  if (isIncomingDaybookEntry(entry)) {
    return (entry.bagSizes ?? []).reduce(
      (total, bag) => total + bag.initialQuantity,
      0,
    )
  }

  if (isOutgoingDaybookEntry(entry)) {
    return (entry.orderDetails ?? []).reduce(
      (total, line) => total + line.quantityIssued,
      0,
    )
  }

  return 0
}

export function sumSizeColumn(rows: DaybookEntry[], size: string): number {
  return rows.reduce((total, row) => {
    const quantity = getGatePassSizeQuantity(row, size)
    return total + (quantity ?? 0)
  }, 0)
}

export function sumTotalBags(rows: DaybookEntry[]): number {
  return rows.reduce((total, row) => total + getGatePassTotalBags(row), 0)
}
