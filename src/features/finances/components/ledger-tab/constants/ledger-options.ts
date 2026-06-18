import type { ComboboxOption } from "@/components/searchable-option-combobox"

export const LEDGER_TYPES = [
  "Asset",
  "Expense",
  "Liability",
  "Income",
  "Equity",
] as const

export type LedgerType = (typeof LEDGER_TYPES)[number]

export const TYPE_SUB_TYPE_MAP: Record<LedgerType, readonly string[]> = {
  Asset: ["Current Asset", "Sundry Debtor"],
  Expense: ["Indirect Expense", "Direct Expense"],
  Liability: ["Sundry Creditor", "Capital"],
  Income: ["Direct Income"],
  Equity: [],
}

const CATEGORY_LABELS = [
  "Cash & Bank",
  "Parties",
  "Operating",
  "Operations",
  "Equity",
] as const

export const LEDGER_CATEGORY_OPTIONS: ComboboxOption[] = CATEGORY_LABELS.map(
  (label) => ({
    id: label,
    label,
  })
)

export const LEDGER_TYPE_OPTIONS: ComboboxOption[] = LEDGER_TYPES.map(
  (type) => ({
    id: type,
    label: type,
  })
)

export function toComboboxOptions(values: readonly string[]): ComboboxOption[] {
  return values.map((value) => ({
    id: value,
    label: value,
  }))
}

export function getSubTypeOptionsForType(type: string): ComboboxOption[] {
  return toComboboxOptions(getSubTypesForType(type))
}

export function getSubTypesForType(type: string): string[] {
  if (!type || !(type in TYPE_SUB_TYPE_MAP)) {
    return []
  }

  return [...TYPE_SUB_TYPE_MAP[type as LedgerType]]
}
