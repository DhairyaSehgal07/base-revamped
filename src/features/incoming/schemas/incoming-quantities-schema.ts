import * as z from "zod"
import { BAG_SIZES, BAG_TYPES, DEFAULT_BAG_TYPE } from "@/lib/constants"

const incomingQuantityRowSchema = z.object({
  size: z.union([z.enum(BAG_SIZES), z.literal("")]),
  isExtra: z.boolean(),
  qty: z.number().nonnegative("Quantity cannot be negative.").optional(),
  bagType: z.enum(BAG_TYPES),
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
})

export const incomingQuantitiesSchema = z.object({
  quantities: z.array(incomingQuantityRowSchema).superRefine((rows, ctx) => {
    rows.forEach((row, index) => {
      if (row.isExtra && row.size === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a bag size.",
          path: [index, "size"],
        })
      }
    })
  }),
})

export type IncomingQuantitiesValues = z.infer<typeof incomingQuantitiesSchema>

export type IncomingQuantityRow = IncomingQuantitiesValues["quantities"][number]

export function createDefaultIncomingQuantities(): IncomingQuantityRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: "",
    floor: "",
    row: "",
  }))
}

export function createEmptyIncomingQuantityRow(): IncomingQuantityRow {
  return {
    size: "",
    isExtra: true,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: "",
    floor: "",
    row: "",
  }
}
