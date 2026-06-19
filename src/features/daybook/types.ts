export type DaybookLocation = {
  chamber: string
  floor: string
  row: string
}

export type DaybookFarmer = {
  _id: string
  name: string
  address: string
  mobileNumber: string
}

export type DaybookFarmerStorageLink = {
  _id: string
  farmerId: DaybookFarmer
  accountNumber: number
  name?: string
  address?: string
  mobileNumber?: string
}

export type DaybookCreatedBy = {
  _id: string
  name: string
}

export type IncomingBagSize = {
  name: string
  initialQuantity: number
  currentQuantity: number
  location: DaybookLocation
}

export type IncomingDaybookEntry = {
  _id: string
  gatePassNo: number
  manualParchiNumber?: string | number
  stockFilter?: string
  customMarka?: string
  date: string
  createdAt: string
  updatedAt?: string
  type: "RECEIPT"
  variety: string
  truckNumber?: string
  bagSizes?: IncomingBagSize[]
  status: string
  remarks: string
  farmerStorageLinkId: DaybookFarmerStorageLink
  createdBy?: DaybookCreatedBy | null
}

export type OutgoingSnapshotBagSize = {
  name: string
  initialQuantity: number
  currentQuantity: number
  type: string
  quantityIssued: number
  location: DaybookLocation
}

export type IncomingGatePassSnapshot = {
  _id: string
  gatePassNo: number
  variety: string
  bagSizes: OutgoingSnapshotBagSize[]
}

export type OutgoingOrderDetail = {
  size: string
  quantityAvailable: number
  quantityIssued: number
  location: DaybookLocation
}

export type OutgoingDaybookEntry = {
  _id: string
  gatePassNo: number
  manualParchiNumber?: string | number
  truckNumber?: string
  from?: string
  to?: string
  date: string
  createdAt: string
  updatedAt?: string
  type?: "DELIVERY" | "Outgoing-transfer" | string
  variety?: string
  orderDetails?: OutgoingOrderDetail[]
  incomingGatePassSnapshots?: IncomingGatePassSnapshot[]
  remarks: string
  farmerStorageLinkId: DaybookFarmerStorageLink
  createdBy?: DaybookCreatedBy | null
}

export type DaybookEntry = IncomingDaybookEntry | OutgoingDaybookEntry

export type DaybookPagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

export function isIncomingDaybookEntry(
  entry: DaybookEntry
): entry is IncomingDaybookEntry {
  return entry.type === "RECEIPT"
}

export function isOutgoingDaybookEntry(
  entry: DaybookEntry
): entry is OutgoingDaybookEntry {
  return (
    entry.type !== "RECEIPT" &&
    "orderDetails" in entry &&
    Array.isArray(entry.orderDetails)
  )
}
