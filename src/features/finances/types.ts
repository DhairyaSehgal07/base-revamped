export type VoucherLedgerRef = {
  _id: string
  name: string
}

export type VoucherApiRecord = {
  _id: string
  type: string
  voucherNumber: number
  date: string
  debitLedger: VoucherLedgerRef
  creditLedger: VoucherLedgerRef
  amount: number
  narration: string
  coldStorageId: string
  farmerStorageLinkId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type VouchersResponse = {
  success: boolean
  data: VoucherApiRecord[] | null
}

export type VoucherFilters = {
  from?: string
  to?: string
  ledgerId?: string
}

export type LedgerType =
  | "Asset"
  | "Liability"
  | "Income"
  | "Expense"
  | "Equity"

export type LedgerApiRecord = {
  _id: string
  name: string
  type: LedgerType
  subType: string
  category: string
  openingBalance: number
  balance: number
  closingBalance: number | null
  coldStorageId: string
  farmerStorageLinkId: string | null
  createdBy: string
  isSystemLedger: boolean
  createdAt: string
  updatedAt: string
  transactionCount: number
}

export type LedgersResponse = {
  success: boolean
  data: LedgerApiRecord[] | null
}

export type LedgerFilters = {
  type?: LedgerType
  search?: string
  farmerStorageLinkId?: string
  from?: string
  to?: string
}
