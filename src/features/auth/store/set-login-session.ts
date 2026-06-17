import type { LoginResponseData } from "../types"
import { useAuthStore } from "./use-auth-store"
import { useColdStorageStore } from "./use-cold-storage-store"
import { usePreferencesStore } from "./use-preferences-store"
import { useStoreAdminStore } from "./use-store-admin-store"

export function setLoginSession({ storeAdmin, token }: LoginResponseData) {
  const { coldStorageId: coldStorage, ...admin } = storeAdmin
  const { preferencesId: preferences, ...coldStorageFields } = coldStorage

  useAuthStore.getState().setToken(token)
  useStoreAdminStore.getState().setStoreAdmin({
    ...admin,
    coldStorageId: coldStorage._id,
  })
  useColdStorageStore.getState().setColdStorage({
    ...coldStorageFields,
    preferencesId: preferences._id,
  })
  usePreferencesStore.getState().setPreferences(preferences)
}
