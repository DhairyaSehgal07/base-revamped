import * as z from "zod"

export const outgoingEditFormSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().int().positive("Manual gate pass number must be positive."),
  ]),
  date: z.string().min(1, "Date is required"),
  from: z.string().max(200),
  to: z.string().max(200),
  truckNumber: z.string().max(50),
  remarks: z.string().max(500),
})

export type OutgoingEditFormValues = z.infer<typeof outgoingEditFormSchema>
