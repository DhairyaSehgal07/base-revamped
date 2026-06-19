import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IncomingQuantitiesSection } from "@/features/incoming/forms/incoming-quantities-section"
import { IncomingSummarySheet } from "@/features/incoming/forms/incoming-summary-sheet"
import { useCreateIncomingForm } from "@/features/incoming/forms/use-create-incoming-form"
import {
  createDefaultIncomingQuantities,
  createIncomingFormSchema,
} from "@/features/incoming/schemas/incoming-form-schema"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerInput } from "@/components/date-picker"
import { usePreferencesStore } from "@/features/auth/store/use-preferences-store"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from "@/components/searchable-option-combobox"
import {
  buildIncomingFormSchemaConfig,
  createQuantitiesForSizes,
  getBagSizesForCommodity,
  getCommodityByName,
  getDefaultCommodityName,
  shouldShowCommoditySelect,
  shouldShowCustomMarka,
  shouldShowStockFilter,
  toComboboxOptions,
} from "@/features/incoming/utils/incoming-preferences"

const MOCK_FARMER_LINKS = [
  {
    id: "507f1f77bcf86cd799439011",
    label: "Rajesh Sehgal — Acct #12045",
  },
  {
    id: "507f191e810c19729de860ea",
    label: "Gurpreet Singh — Acct #9821",
  },
  {
    id: "507f191e810c19729de860eb",
    label: "Harbhajan Singh — Acct #7643",
  },
  {
    id: "507f191e810c19729de860ec",
    label: "Maninder Pal — Acct #4512",
  },
  {
    id: "507f191e810c19729de860ed",
    label: "Jaswinder Kaur — Acct #8834",
  },
  {
    id: "507f191e810c19729de860ee",
    label: "Baldev Singh — Acct #2391",
  },
  {
    id: "507f191e810c19729de860ef",
    label: "Ranjit Kumar — Acct #6745",
  },
  {
    id: "507f191e810c19729de860f0",
    label: "Sukhchain Singh — Acct #1189",
  },
  {
    id: "507f191e810c19729de860f1",
    label: "Paramjit Kaur — Acct #5520",
  },
  {
    id: "507f191e810c19729de860f2",
    label: "Kuldeep Singh — Acct #9076",
  },
  {
    id: "507f191e810c19729de860f3",
    label: "Amritpal Singh — Acct #3318",
  },
  {
    id: "507f191e810c19729de860f4",
    label: "Navjot Singh — Acct #4467",
  },
] as const

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const numericInputProps = {
  type: "number" as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
}

const CreateIncomingForm = () => {
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const preferences = usePreferencesStore((s) => s.preferences)
  const commodities = useMemo(
    () => preferences?.commodities ?? [],
    [preferences?.commodities]
  )

  const defaultCommodityName = useMemo(
    () => getDefaultCommodityName(commodities),
    [commodities]
  )
  const initialBagSizes = useMemo(
    () =>
      getBagSizesForCommodity(
        getCommodityByName(commodities, defaultCommodityName)
      ),
    [commodities, defaultCommodityName]
  )

  const [selectedCommodityName, setSelectedCommodityName] = useState("")

  const resolvedCommodityName = selectedCommodityName || defaultCommodityName

  const schemaConfig = useMemo(
    () => buildIncomingFormSchemaConfig(preferences, resolvedCommodityName),
    [preferences, resolvedCommodityName]
  )

  const showCommoditySelect = shouldShowCommoditySelect(commodities)
  const showStockFilter = shouldShowStockFilter(preferences?.stockFilter)
  const showCustomMarka = shouldShowCustomMarka(preferences?.customMarka)

  const selectedCommodity = useMemo(
    () => getCommodityByName(commodities, resolvedCommodityName),
    [commodities, resolvedCommodityName]
  )

  const varietyOptions = useMemo(
    () => toComboboxOptions(selectedCommodity?.varieties ?? []),
    [selectedCommodity]
  )
  const stockFilterOptions = useMemo(
    () => toComboboxOptions(preferences?.stockFilter?.options ?? []),
    [preferences?.stockFilter?.options]
  )
  const commodityOptions = useMemo(
    () => toComboboxOptions(commodities.map((commodity) => commodity.name)),
    [commodities]
  )
  const bagSizes = useMemo(
    () => getBagSizesForCommodity(selectedCommodity),
    [selectedCommodity]
  )

  const farmerOptions = useMemo<ComboboxOption[]>(
    () => [...MOCK_FARMER_LINKS],
    []
  )
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false)
  const [commoditySearch, setCommoditySearch] = useState("")
  const [commodityComboboxOpen, setCommodityComboboxOpen] = useState(false)
  const [varietySearch, setVarietySearch] = useState("")
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false)
  const [stockFilterSearch, setStockFilterSearch] = useState("")
  const [stockFilterComboboxOpen, setStockFilterComboboxOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions]
  )
  const sortedCommodities = useMemo(
    () => filterAndSortOptions(commoditySearch, commodityOptions),
    [commoditySearch, commodityOptions]
  )
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, varietyOptions),
    [varietySearch, varietyOptions]
  )
  const sortedStockFilters = useMemo(
    () => filterAndSortOptions(stockFilterSearch, stockFilterOptions),
    [stockFilterSearch, stockFilterOptions]
  )

  const form = useCreateIncomingForm({
    schemaConfig,
    initialCommodity: defaultCommodityName,
    initialBagSizes,
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
  })

  const resetCropComboboxState = useCallback(() => {
    setCommoditySearch("")
    setCommodityComboboxOpen(false)
    setVarietySearch("")
    setVarietyComboboxOpen(false)
    setStockFilterSearch("")
    setStockFilterComboboxOpen(false)
  }, [])

  const handleCommodityChange = useCallback(
    (commodityName: string) => {
      const commodity = getCommodityByName(commodities, commodityName)
      setSelectedCommodityName(commodityName)
      form.setFieldValue("variety", "")
      form.setFieldValue("stockFilter", "")
      form.setFieldValue("customMarka", "")
      form.setFieldValue(
        "quantities",
        createQuantitiesForSizes(commodity?.sizes ?? [])
      )
      resetCropComboboxState()
    },
    [commodities, form, resetCropComboboxState]
  )

  const getFarmerLabel = (farmerIncomingLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerIncomingLinkId)?.label ??
    farmerIncomingLinkId

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: "review" })
  }

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: "submit" })
  }

  const handleResetForm = () => {
    form.reset()
    setSelectedCommodityName("")
    form.setFieldValue("commodity", defaultCommodityName)
    form.setFieldValue(
      "quantities",
      createDefaultIncomingQuantities(initialBagSizes)
    )
    setFarmerSearch("")
    setFarmerComboboxOpen(false)
    resetCropComboboxState()
  }

  useEffect(() => {
    if (userId) {
      form.setFieldValue("createdBy", userId)
    }
  }, [form, userId])

  useEffect(() => {
    if (defaultCommodityName) {
      form.setFieldValue("commodity", defaultCommodityName)
      form.setFieldValue(
        "quantities",
        createDefaultIncomingQuantities(initialBagSizes)
      )
    }
  }, [defaultCommodityName, form, initialBagSizes])

  const cropFieldsDisabled = commodities.length === 0 || !selectedCommodity

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Incoming Gate Pass <span className="text-primary">#—</span>
        </CardTitle>
        <CardDescription className="text-base">
          Record crop and account details for a new incoming gate pass.
        </CardDescription>
      </CardHeader>

      <form
        id="create-incoming-form"
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                General Information
              </FieldLegend>
              <FieldDescription>
                Gate pass reference, date, and linked farmer account.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="manualGatePassNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Manual Gate Pass No.
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              parseOptionalPositiveNumber(e.target.value)
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024 (optional)"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="date">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id={field.name}
                          label="Date"
                          value={
                            field.state.value
                              ? new Date(field.state.value)
                              : undefined
                          }
                          onChange={(date) =>
                            field.handleChange(date ? date.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="Pick a date"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="farmerIncomingLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:col-span-2"
                      >
                        <FieldLabel htmlFor="create-incoming-farmer">
                          Farmer
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search farmers..."
                          emptyMessage="No farmers found."
                          options={farmerOptions}
                          sortedOptions={sortedFarmers}
                          search={farmerSearch}
                          setSearch={setFarmerSearch}
                          open={farmerComboboxOpen}
                          setOpen={setFarmerComboboxOpen}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Crop Information
              </FieldLegend>
              <FieldDescription>
                Commodity, variety, and stock attributes for incoming crop.
              </FieldDescription>
              {commodities.length === 0 ? (
                <FieldDescription className="mt-3 text-muted-foreground">
                  No commodities configured in preferences. Add commodities in
                  settings to record crop details.
                </FieldDescription>
              ) : null}
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                {showCommoditySelect ? (
                  <form.Field name="commodity">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta)
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-commodity">
                            Commodity
                          </FieldLabel>
                          <SearchableOptionCombobox
                            id="create-incoming-commodity"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value)
                              handleCommodityChange(value)
                            }}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            placeholder="Search commodities..."
                            emptyMessage="No commodities found."
                            options={commodityOptions}
                            sortedOptions={sortedCommodities}
                            search={commoditySearch}
                            setSearch={setCommoditySearch}
                            open={commodityComboboxOpen}
                            setOpen={setCommodityComboboxOpen}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  </form.Field>
                ) : null}

                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-variety">
                          Variety
                        </FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-variety"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          disabled={cropFieldsDisabled}
                          placeholder="Search varieties..."
                          emptyMessage="No varieties found."
                          options={varietyOptions}
                          sortedOptions={sortedVarieties}
                          search={varietySearch}
                          setSearch={setVarietySearch}
                          open={varietyComboboxOpen}
                          setOpen={setVarietyComboboxOpen}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                {showStockFilter ? (
                  <form.Field name="stockFilter">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta)
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-stock-filter">
                            Stock filter
                          </FieldLabel>
                          <SearchableOptionCombobox
                            id="create-incoming-stock-filter"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            disabled={cropFieldsDisabled}
                            placeholder="Search stock filters..."
                            emptyMessage="No stock filters found."
                            options={stockFilterOptions}
                            sortedOptions={sortedStockFilters}
                            search={stockFilterSearch}
                            setSearch={setStockFilterSearch}
                            open={stockFilterComboboxOpen}
                            setOpen={setStockFilterComboboxOpen}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  </form.Field>
                ) : null}

                {showCustomMarka ? (
                  <form.Field name="customMarka">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta)
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-custom-marka">
                            Custom marka
                          </FieldLabel>
                          <Input
                            id="create-incoming-custom-marka"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            disabled={cropFieldsDisabled}
                            placeholder="Enter marka identifier"
                            className="h-11 text-base"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  </form.Field>
                ) : null}
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <IncomingQuantitiesSection form={form} bagSizes={bagSizes} />

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional Notes
              </FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="sr-only">
                          Remarks
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
                          className="min-h-[120px] resize-y"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button
            variant="outline"
            type="button"
            onClick={handleResetForm}
          >
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleOpenReview}
              >
                {isSubmitting ? "Validating…" : "Review"}
              </Button>
            )}
          />
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = createIncomingFormSchema(schemaConfig).safeParse(values)

          return (
            <IncomingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              farmerLabel={
                parsed.success ? getFarmerLabel(parsed.data.farmerIncomingLinkId) : ""
              }
              showCommodity={showCommoditySelect}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )
        }}
      />
    </Card>
  )
}

export default CreateIncomingForm
