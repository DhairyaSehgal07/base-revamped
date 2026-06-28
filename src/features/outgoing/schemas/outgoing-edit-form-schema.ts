import * as z from "zod"

import { objectId } from "@/features/outgoing/schemas/outgoing-form-schema"

export const outgoingEditFormSchema = z.object({
  farmerStorageLinkId: objectId,
  date: z.string().min(1, "Date is required"),
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().int().positive("Manual gate pass number must be positive."),
  ]),
  from: z.string().max(200),
  to: z.string().max(200),
  truckNumber: z.string().max(50),
  remarks: z.string().max(500),
  allocations: z
    .record(z.string(), z.number().int().min(1))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "Select at least one allocation in the gate passes table",
    }),
})

export type OutgoingEditFormValues = z.infer<typeof outgoingEditFormSchema>
