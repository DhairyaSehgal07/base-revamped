import type {
  DaybookLocation,
  IncomingGatePassSnapshot,
} from "@/features/daybook/types"
import { formatCompactLocation, locationKey } from "@/features/daybook/utils/format"
import type {
  OutgoingGatePassReportRecord,
  OutgoingReportOrderDetail,
} from "@/features/outgoing-report/api/types"
import type { OutgoingQuantityMode } from "@/features/outgoing-report/components/columns"

export type OutgoingReportVarietyBreakdownLine = {
  variety: string
  quantity: number
}

export type OutgoingReportSizeDetailLine = {
  variety: string
  quantity: number
  locationLabel: string | null
}

function findSnapshotForOrderLine(
  snapshots: IncomingGatePassSnapshot[],
  orderLine: OutgoingReportOrderDetail,
): IncomingGatePassSnapshot | undefined {
  if (!orderLine.location) return undefined

  const key = `${orderLine.size}\u001f${locationKey(orderLine.location)}`

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some(
      (bag) => `${bag.name}\u001f${locationKey(bag.location)}` === key,
    ),
  )
}

export function getOrderLineQuantity(
  detail: OutgoingReportOrderDetail,
  quantityMode: OutgoingQuantityMode,
): number {
  return quantityMode === "issued"
    ? detail.quantityIssued
    : detail.quantityAvailable
}

export function getOutgoingReportOrderLineVariety(
  row: OutgoingGatePassReportRecord,
  orderLine: OutgoingReportOrderDetail,
): string {
  const snapshots = row.incomingGatePassSnapshots ?? []
  const snapshot = findSnapshotForOrderLine(snapshots, orderLine)
  return snapshot?.variety?.trim() || row.variety?.trim() || "—"
}

export function getOutgoingReportType(
  row: OutgoingGatePassReportRecord,
): string {
  if (row.type?.trim()) return row.type.trim()

  const snapshots = row.incomingGatePassSnapshots ?? []
  const types = [
    ...new Set(
      snapshots
        .flatMap((snapshot) => snapshot.bagSizes.map((bag) => bag.type))
        .filter((value): value is string => Boolean(value?.trim())),
    ),
  ]

  if (types.length === 1) return types[0]
  if (types.length > 1) return types.join(", ")

  return ""
}

export function getOutgoingReportVariety(
  row: OutgoingGatePassReportRecord,
): string {
  if (row.variety?.trim()) return row.variety.trim()

  const snapshots = row.incomingGatePassSnapshots ?? []
  const varieties = [
    ...new Set(
      snapshots
        .map((snapshot) => snapshot.variety)
        .filter((value): value is string => Boolean(value?.trim())),
    ),
  ]

  if (varieties.length === 1) return varieties[0]
  if (varieties.length > 1) return varieties.join(", ")

  return ""
}

export function getOutgoingReportVarietyBreakdown(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = "issued",
): OutgoingReportVarietyBreakdownLine[] {
  const totals = new Map<string, number>()

  for (const orderLine of row.orderDetails) {
    const quantity = getOrderLineQuantity(orderLine, quantityMode)
    if (quantity <= 0) continue

    const variety = getOutgoingReportOrderLineVariety(row, orderLine)
    totals.set(variety, (totals.get(variety) ?? 0) + quantity)
  }

  return Array.from(totals.entries())
    .map(([variety, quantity]) => ({ variety, quantity }))
    .sort((left, right) => left.variety.localeCompare(right.variety))
}

export function hasMultipleOutgoingReportVarieties(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = "issued",
): boolean {
  return getOutgoingReportVarietyBreakdown(row, quantityMode).length > 1
}

function formatReportOrderLineLocation(
  location?: DaybookLocation,
): string | null {
  if (!location) return null
  return formatCompactLocation(location)
}

export function getOutgoingReportSizeQuantityDetailLines(
  row: OutgoingGatePassReportRecord,
  size: string,
  quantityMode: OutgoingQuantityMode = "issued",
): OutgoingReportSizeDetailLine[] {
  const normalizedSize = size.trim()
  if (!normalizedSize) return []

  const byVariety = new Map<
    string,
    Map<string, OutgoingReportSizeDetailLine>
  >()

  for (const orderLine of row.orderDetails) {
    if (orderLine.size.trim() !== normalizedSize) continue

    const quantity = getOrderLineQuantity(orderLine, quantityMode)
    if (quantity <= 0) continue

    const variety = getOutgoingReportOrderLineVariety(row, orderLine)
    const locationLabel = formatReportOrderLineLocation(orderLine.location)
    const locationKeyValue = orderLine.location
      ? locationKey(orderLine.location)
      : "__no_location__"

    const varietyLocations =
      byVariety.get(variety) ??
      new Map<string, OutgoingReportSizeDetailLine>()

    const existing = varietyLocations.get(locationKeyValue)

    if (existing) {
      existing.quantity += quantity
    } else {
      varietyLocations.set(locationKeyValue, {
        variety,
        quantity,
        locationLabel,
      })
    }

    byVariety.set(variety, varietyLocations)
  }

  return Array.from(byVariety.entries())
    .flatMap(([, locations]) => Array.from(locations.values()))
    .sort((left, right) => {
      const varietyCompare = left.variety.localeCompare(right.variety)
      if (varietyCompare !== 0) return varietyCompare

      return (left.locationLabel ?? "").localeCompare(right.locationLabel ?? "")
    })
}

export function formatOutgoingReportVarietyBreakdownForExport(
  row: OutgoingGatePassReportRecord,
  quantityMode: OutgoingQuantityMode = "issued",
): string {
  const lines = getOutgoingReportVarietyBreakdown(row, quantityMode)
  if (lines.length <= 1) return getOutgoingReportVariety(row)

  return lines
    .map((line) => `${line.variety} (${line.quantity.toLocaleString("en-IN")})`)
    .join("\n")
}

export function formatOutgoingReportSizeDetailLineForExport(
  line: OutgoingReportSizeDetailLine,
): string {
  const parts = [line.quantity.toLocaleString("en-IN")]

  if (line.locationLabel) {
    parts.push(`(${line.locationLabel})`)
  }

  parts.push(`(${line.variety})`)

  return parts.join(" ")
}
