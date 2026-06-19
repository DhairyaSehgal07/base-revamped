import type { DaybookLocation } from "@/features/daybook/types"

export function formatDaybookDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatLocation(location: DaybookLocation): string {
  return `Chamber ${location.chamber} / Floor ${location.floor} / Row ${location.row}`
}

export function formatManualParchi(value: string | number | undefined): string {
  if (value === undefined || value === "") return "—"
  return String(value)
}

export function sumBagQuantities<T extends Record<string, unknown>>(
  bags: T[] | null | undefined,
  field: keyof T
): number {
  return (bags ?? []).reduce((total, bag) => {
    const value = bag[field]
    return total + (typeof value === "number" ? value : 0)
  }, 0)
}

export function locationKey(location: DaybookLocation): string {
  return `${location.chamber}\u001f${location.floor}\u001f${location.row}`
}

export function formatQuantity(value: number): string {
  return value.toLocaleString("en-IN")
}
