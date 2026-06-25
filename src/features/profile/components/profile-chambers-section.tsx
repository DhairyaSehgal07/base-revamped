import { Plus, Trash2, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { numericInputProps } from "@/lib/form-utils"
import type { ProfileFormApi } from "../forms/use-profile-form"
import { emptyChamber } from "../schemas/profile-form-schema"

type ProfileChambersSectionProps = {
  form: ProfileFormApi
}

export function ProfileChambersSection({ form }: ProfileChambersSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
          <Warehouse className="size-4 text-primary" aria-hidden />
          Chambers
        </CardTitle>
        <CardDescription>
          Define storage chambers and their individual capacities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.Field name="coldStorage.chambers" mode="array">
          {(field) => (
            <div className="flex flex-col gap-4">
              {field.state.value.length === 0 ? (
                <Empty className="border border-dashed border-border p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Warehouse aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>No chambers</EmptyTitle>
                    <EmptyDescription>
                      Add chambers to track stock by location across your cold
                      storage.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                field.state.value.map((_, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:p-5"
                  >
                    <form.Field name={`coldStorage.chambers[${index}].name`}>
                      {(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched &&
                          !subField.state.meta.isValid

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={subField.name}>
                              Chamber name
                            </FieldLabel>
                            <Input
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              onBlur={subField.handleBlur}
                              onChange={(event) =>
                                subField.handleChange(event.target.value)
                              }
                              placeholder="e.g. Chamber A"
                              aria-invalid={isInvalid}
                            />
                            {isInvalid && (
                              <FieldError errors={subField.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    </form.Field>

                    <form.Field name={`coldStorage.chambers[${index}].capacity`}>
                      {(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched &&
                          !subField.state.meta.isValid

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={subField.name}>Capacity</FieldLabel>
                            <Input
                              id={subField.name}
                              name={subField.name}
                              {...numericInputProps}
                              min={1}
                              step={1}
                              inputMode="numeric"
                              value={
                                subField.state.value === 0
                                  ? ""
                                  : subField.state.value
                              }
                              onBlur={subField.handleBlur}
                              onChange={(event) =>
                                subField.handleChange(
                                  event.target.value === ""
                                    ? 0
                                    : Number(event.target.value),
                                )
                              }
                              aria-invalid={isInvalid}
                              className="tabular-nums"
                            />
                            {isInvalid && (
                              <FieldError errors={subField.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    </form.Field>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0"
                        aria-label={`Remove chamber ${index + 1}`}
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => field.pushValue(emptyChamber())}
              >
                <Plus className="mr-2 size-4" aria-hidden />
                Add chamber
              </Button>
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  )
}
