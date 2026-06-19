import type { ComboboxOption } from "@/components/searchable-option-combobox"
import type {
  CommodityPreference,
  Preferences,
  StockFilterPreference,
} from "@/features/auth/types"
import { createDefaultIncomingQuantities } from "@/features/incoming/schemas/incoming-quantities-schema"

export function toComboboxOptions(values: string[]): ComboboxOption[] {
  return values.map((value) => ({ id: value, label: value }))
}

export function getDefaultCommodityName(
  commodities: CommodityPreference[]
): string {
  return commodities.length === 1 ? commodities[0].name : ""
}

export function getCommodityByName(
  commodities: CommodityPreference[],
  name: string
): CommodityPreference | undefined {
  return commodities.find((commodity) => commodity.name === name)
}

export function shouldShowCommoditySelect(
  commodities: CommodityPreference[]
): boolean {
  return commodities.length > 1
}

export function shouldShowStockFilter(
  stockFilter: StockFilterPreference | undefined
): boolean {
  return Boolean(stockFilter?.enabled && stockFilter.options.length > 0)
}

export function shouldShowCustomMarka(customMarka: boolean | undefined): boolean {
  return customMarka === true
}

export function getBagSizesForCommodity(
  commodity: CommodityPreference | undefined
): string[] {
  return commodity?.sizes ?? []
}

export function createQuantitiesForSizes(sizes: string[]) {
  return createDefaultIncomingQuantities(sizes)
}

export function buildIncomingFormSchemaConfig(
  preferences: Preferences | null,
  selectedCommodityName: string
) {
  const commodities = preferences?.commodities ?? []
  const selectedCommodity = getCommodityByName(
    commodities,
    selectedCommodityName
  )
  const bagSizes = getBagSizesForCommodity(selectedCommodity)

  return {
    requireCommodity: commodities.length > 0,
    requireStockFilter: shouldShowStockFilter(preferences?.stockFilter),
    requireCustomMarka: shouldShowCustomMarka(preferences?.customMarka),
    bagSizes,
  }
}
