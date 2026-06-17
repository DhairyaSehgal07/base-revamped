import * as z from "zod"
import { incomingQuantitiesSchema } from "@/features/incoming/schemas/incoming-quantities-schema"

export const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

const incomingBaseSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive("Enter a positive gate pass number."),
  ]),
  farmerIncomingLinkId: objectId,
  createdBy: objectId,
  variety: z.string().min(1, "Select a variety."),
  category: z.string().min(1, "Select a category."),
  date: z.string().datetime("Select a valid date."),
  remarks: z.string(),
})

export const incomingFormSchema = incomingBaseSchema.merge(incomingQuantitiesSchema)

export {
  incomingQuantitiesSchema,
  createDefaultIncomingQuantities,
  createEmptyIncomingQuantityRow,
  type IncomingQuantityRow,
} from "@/features/incoming/schemas/incoming-quantities-schema"
