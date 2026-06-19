export type FarmerStorageLink = {
  _id: string
  accountNumber: number
  name: string
  address: string
  mobileNumber: string
  isActive: boolean
  costPerBag: number
}

export type FarmerStorageLinksResponse = {
  success: boolean
  data: FarmerStorageLink[] | null
}

export type QuickRegisterFarmerPayload = {
  accountNumber: number
  name: string
  address: string
  mobileNumber: string
  costPerBag: number
  openingBalance?: number
}

export type QuickRegisterFarmerResponse = {
  success: boolean
  message?: string
  data: FarmerStorageLink | null
}
