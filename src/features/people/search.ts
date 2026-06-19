import { z } from "zod"

export const PERSON_DETAIL_TAB_VALUES = [
  "incoming",
  "dispatch-ledger",
] as const

export const personDetailTabSchema = z.enum(PERSON_DETAIL_TAB_VALUES)

export const personDetailSearchSchema = z.object({
  name: z.string().optional().catch(undefined),
  mobileNumber: z.string().optional().catch(undefined),
  accountNumber: z.coerce.number().optional().catch(undefined),
  address: z.string().optional().catch(undefined),
  costPerBag: z.coerce.number().optional().catch(undefined),
  tab: personDetailTabSchema.catch("incoming"),
})

export type PersonDetailTab = z.infer<typeof personDetailTabSchema>
export type PersonDetailSearch = z.infer<typeof personDetailSearchSchema>
