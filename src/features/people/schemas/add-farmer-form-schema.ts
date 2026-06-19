import * as z from "zod"

import type { QuickRegisterFarmerPayload } from "@/features/people/types"

export type AddFarmerFormInput = {
  accountNumber: string
  mobileNumber: string
  name: string
  address: string
  costPerBag: string
  openingBalance: string
}

type AddFarmerFormSchemaOptions = {
  getUsedAccountNumbers: () => number[]
  getUsedMobileNumbers: () => string[]
}

function parseOptionalNonNegativeNumber(
  value: string,
): number | undefined {
  if (value.trim() === "") {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseAccountNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined
  }

  return parsed
}

export function createAddFarmerFormSchema({
  getUsedAccountNumbers,
  getUsedMobileNumbers,
}: AddFarmerFormSchemaOptions) {
  return z
    .object({
      accountNumber: z.string().trim().min(1, "Account number is required"),
      mobileNumber: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
      name: z.string().trim().min(1, "Name is required"),
      address: z.string().trim().min(1, "Address is required"),
      costPerBag: z.string(),
      openingBalance: z.string(),
    })
    .superRefine((values, ctx) => {
      const accountNumber = parseAccountNumber(values.accountNumber)
      if (accountNumber === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a positive whole number",
          path: ["accountNumber"],
        })
      } else if (getUsedAccountNumbers().includes(accountNumber)) {
        ctx.addIssue({
          code: "custom",
          message: "This account number is already in use",
          path: ["accountNumber"],
        })
      }

      const usedMobileNumbers = getUsedMobileNumbers()
      if (usedMobileNumbers.includes(values.mobileNumber)) {
        ctx.addIssue({
          code: "custom",
          message: "This mobile number is already linked to a farmer",
          path: ["mobileNumber"],
        })
      }

      if (values.costPerBag.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Cost per bag is required",
          path: ["costPerBag"],
        })
      } else {
        const parsed = parseOptionalNonNegativeNumber(values.costPerBag)
        if (parsed === undefined || parsed < 0) {
          ctx.addIssue({
            code: "custom",
            message: "Enter a valid amount of 0 or greater",
            path: ["costPerBag"],
          })
        }
      }

      if (values.openingBalance.trim() !== "") {
        const parsed = parseOptionalNonNegativeNumber(values.openingBalance)
        if (parsed === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "Enter a valid amount",
            path: ["openingBalance"],
          })
        }
      }
    })
}

export function createDefaultAddFarmerValues(
  nextAccountNumber: number,
): AddFarmerFormInput {
  return {
    accountNumber: nextAccountNumber.toString(),
    mobileNumber: "",
    name: "",
    address: "",
    costPerBag: "",
    openingBalance: "",
  }
}

export function buildAddFarmerPayload(
  values: AddFarmerFormInput,
): QuickRegisterFarmerPayload {
  const accountNumber = parseAccountNumber(values.accountNumber)
  if (accountNumber === undefined) {
    throw new Error("Account number is invalid")
  }

  const costPerBag = parseOptionalNonNegativeNumber(values.costPerBag)
  const openingBalance = parseOptionalNonNegativeNumber(values.openingBalance)

  if (costPerBag === undefined) {
    throw new Error("Cost per bag is invalid")
  }

  return {
    accountNumber,
    mobileNumber: values.mobileNumber,
    name: values.name.trim(),
    address: values.address.trim(),
    costPerBag,
    ...(openingBalance !== undefined ? { openingBalance } : {}),
  }
}
