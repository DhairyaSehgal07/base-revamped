import type { OutgoingGatePassReportRecord } from "@/features/outgoing-report/api/types"

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
