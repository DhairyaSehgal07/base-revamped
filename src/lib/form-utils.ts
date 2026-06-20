import type React from "react"

export function parseOptionalNumber(value: string): number | undefined {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
} as const
