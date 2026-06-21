import { useCallback, useEffect, useMemo } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

import { DatePickerInput } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { OutgoingDaybookEntry } from "@/features/daybook/types"
import { useUpdateOutgoingGatePass } from "@/features/outgoing/api/use-update-outgoing-gate-pass"
import { useEditOutgoingGatePassForm } from "@/features/outgoing/forms/use-edit-outgoing-gate-pass-form"
import type { OutgoingEditFormValues } from "@/features/outgoing/schemas/outgoing-edit-form-schema"
import { outgoingDaybookEntryToEditFormValues } from "@/features/outgoing/utils/outgoing-daybook-entry-to-edit-form-values"
import { buildUpdateOutgoingGatePassPayload } from "@/features/outgoing/utils/outgoing-edit-form-values-to-update-payload"
import {
  numericInputProps,
  normalizeUppercase,
  parseOptionalNumber,
} from "@/lib/form-utils"

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid
}

type EditOutgoingGatePassSheetProps = {
  entry: OutgoingDaybookEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditOutgoingGatePassSheet({
  entry,
  open,
  onOpenChange,
}: EditOutgoingGatePassSheetProps) {
  const { mutateAsync: updateOutgoingGatePass, isPending: isSaving } =
    useUpdateOutgoingGatePass()

  const defaultValues = useMemo(
    () => outgoingDaybookEntryToEditFormValues(entry),
    [entry]
  )

  const handleSave = useCallback(
    async (values: OutgoingEditFormValues) => {
      const payload = buildUpdateOutgoingGatePassPayload(values, defaultValues)

      if (!payload) {
        toast.info("No changes to save", { position: "bottom-right" })
        return
      }

      try {
        await updateOutgoingGatePass({ id: entry._id, payload })
        toast.success(
          `Outgoing gate pass #${entry.gatePassNo.toLocaleString("en-IN")} updated`,
          { position: "bottom-right" }
        )
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update outgoing gate pass",
          { position: "bottom-right" }
        )
      }
    },
    [
      defaultValues,
      entry._id,
      entry.gatePassNo,
      onOpenChange,
      updateOutgoingGatePass,
    ]
  )

  const form = useEditOutgoingGatePassForm({
    defaultValues,
    onSave: handleSave,
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues)
    }
    onOpenChange(nextOpen)
  }

  const farmerName = entry.farmerStorageLinkId.name

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-700/10 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              <Pencil className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none font-semibold">
                Edit OGP{" "}
                <span className="font-mono tabular-nums">
                  #{entry.gatePassNo.toLocaleString("en-IN")}
                </span>
              </SheetTitle>
              <SheetDescription className="truncate text-xs leading-snug text-muted-foreground">
                {farmerName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id={`edit-outgoing-${entry._id}`}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="@container/field-group gap-4">
              <form.Field name="manualGatePassNumber">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`edit-outgoing-manual-${entry._id}`}>
                        Manual gate pass no.
                      </FieldLabel>
                      <Input
                        {...numericInputProps}
                        id={`edit-outgoing-manual-${entry._id}`}
                        name={field.name}
                        value={
                          field.state.value != null
                            ? String(field.state.value)
                            : ""
                        }
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseOptionalNumber(e.target.value))
                        }
                        inputMode="numeric"
                        placeholder="Optional"
                        aria-invalid={isInvalid}
                        className="tabular-nums"
                      />
                      <FieldDescription>
                        Optional reference number if used on the physical pass.
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
                        id={`edit-outgoing-date-${entry._id}`}
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

              <FieldGroup className="grid grid-cols-1 gap-4 @md/field-group:grid-cols-3">
                <form.Field name="from">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`edit-outgoing-from-${entry._id}`}>
                          From
                        </FieldLabel>
                        <Input
                          id={`edit-outgoing-from-${entry._id}`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Optional"
                          autoComplete="off"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="to">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`edit-outgoing-to-${entry._id}`}>
                          To
                        </FieldLabel>
                        <Input
                          id={`edit-outgoing-to-${entry._id}`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Optional"
                          autoComplete="off"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="truckNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`edit-outgoing-truck-${entry._id}`}>
                          Truck number
                        </FieldLabel>
                        <Input
                          id={`edit-outgoing-truck-${entry._id}`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              normalizeUppercase(e.target.value)
                            )
                          }
                          placeholder="Optional"
                          autoComplete="off"
                          aria-invalid={isInvalid}
                          className="uppercase"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>

              <form.Field name="remarks">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`edit-outgoing-remarks-${entry._id}`}>
                        Remarks
                      </FieldLabel>
                      <Textarea
                        id={`edit-outgoing-remarks-${entry._id}`}
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
          </div>

          <SheetFooter className="flex-row gap-2.5 border-t border-border/40 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
