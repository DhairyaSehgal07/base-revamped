import type {
  DaybookLocation,
  IncomingGatePassSnapshot,
  OutgoingSnapshotBagSize,
} from "@/features/daybook/types"
import type {
  OutgoingGatePassAuditOrderDetail,
  OutgoingGatePassAuditState,
} from "@/features/outgoing-edit-history/types"

export const OUTGOING_GATE_PASS_AUDIT_FIELD_LABELS: Record<
  keyof OutgoingGatePassAuditState,
  string
> = {
  date: "Date",
  variety: "Commodity",
  truckNumber: "Truck number",
  remarks: "Remarks",
  manualParchiNumber: "Manual parchi",
  from: "From",
  to: "To",
  orderDetails: "Order details",
  incomingGatePassSnapshots: "Incoming gate pass snapshots",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatLocation(location: DaybookLocation) {
  const parts = [location.chamber, location.floor, location.row].filter(Boolean)
  return parts.length > 0 ? parts.join(" / ") : "-"
}

function formatOrderDetailsSummary(orderDetails: OutgoingGatePassAuditOrderDetail[]) {
  if (orderDetails.length === 0) return "-"

  const totalIssued = orderDetails.reduce(
    (sum, line) => sum + line.quantityIssued,
    0
  )

  return `${orderDetails.length} line${orderDetails.length === 1 ? "" : "s"} · ${formatNumber(totalIssued)} issued`
}

function formatSnapshotsSummary(snapshots: IncomingGatePassSnapshot[]) {
  if (snapshots.length === 0) return "-"

  const totalIssued = snapshots.reduce(
    (sum, snapshot) =>
      sum +
      snapshot.bagSizes.reduce(
        (bagSum, bag) => bagSum + bag.quantityIssued,
        0
      ),
    0
  )

  return `${snapshots.length} pass${snapshots.length === 1 ? "" : "es"} · ${formatNumber(totalIssued)} issued`
}

export function formatAuditFieldValue(
  field: keyof OutgoingGatePassAuditState,
  value: unknown
): string {
  if (value == null || value === "") return "-"

  switch (field) {
    case "date":
      return typeof value === "string" ? formatDate(value) : "-"
    case "orderDetails":
      return Array.isArray(value)
        ? formatOrderDetailsSummary(value as OutgoingGatePassAuditOrderDetail[])
        : "-"
    case "incomingGatePassSnapshots":
      return Array.isArray(value)
        ? formatSnapshotsSummary(value as IncomingGatePassSnapshot[])
        : "-"
    default:
      return String(value)
  }
}

export function getOutgoingGatePassAuditChangedFields(
  previousState: OutgoingGatePassAuditState | null | undefined,
  modifiedState: OutgoingGatePassAuditState | null | undefined
): Array<keyof OutgoingGatePassAuditState> {
  const beforeState = previousState ?? {}
  const afterState = modifiedState ?? {}

  const fields = new Set([
    ...Object.keys(beforeState),
    ...Object.keys(afterState),
  ]) as Set<keyof OutgoingGatePassAuditState>

  return [...fields].filter((field) => {
    const before = beforeState[field]
    const after = afterState[field]

    if (field === "orderDetails" || field === "incomingGatePassSnapshots") {
      return JSON.stringify(before ?? []) !== JSON.stringify(after ?? [])
    }

    return before !== after
  })
}

export function formatAuditLocation(location: DaybookLocation) {
  return formatLocation(location)
}

export type { OutgoingSnapshotBagSize }
