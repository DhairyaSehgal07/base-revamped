import type {
  ColdStorage,
  ColdStoragePopulated,
  StoreAdmin,
} from "@/features/auth/types"

export interface ProfileStoreAdmin extends StoreAdmin {
  failedLoginAttempts?: number
  lockedUntil?: string
}

export interface ProfileData {
  storeAdmin: ProfileStoreAdmin
  coldStorage: ColdStoragePopulated
}

export interface ProfileResponse {
  success: boolean
  data: ProfileData | null
}

export interface UpdateProfilePayload {
  name?: string
  mobileNumber?: string
  password?: string
  coldStorage?: Partial<
    Pick<ColdStorage, "name" | "address" | "mobileNumber" | "capacity">
  >
}

export interface UpdateProfileResponse {
  success: boolean
  data: ProfileData | null
  message?: string
}
