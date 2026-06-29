import * as z from "zod"
import { TRUCK_NUMBER_MAX_LENGTH } from "@/lib/form-utils"

export const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

export const outgoingFormSchema = z.object({
  farmerStorageLinkId: objectId,
  date: z.string().min(1, "Date is required"),
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().int().positive("Manual gate pass number must be positive."),
  ]),
  from: z.string(),
  to: z.string(),
  truckNumber: z
    .string()
    .max(
      TRUCK_NUMBER_MAX_LENGTH,
      `Truck number must be at most ${TRUCK_NUMBER_MAX_LENGTH} characters.`
    ),
  remarks: z.string().max(500),
  allocations: z
    .record(z.string(), z.number().int().min(1))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "Select at least one allocation in the gate passes table",
    }),
})

export type OutgoingFormValues = z.infer<typeof outgoingFormSchema>
