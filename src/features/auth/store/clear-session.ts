import { useAuthStore } from "./use-auth-store"
import { useColdStorageStore } from "./use-cold-storage-store"
import { usePreferencesStore } from "./use-preferences-store"
import { useStoreAdminStore } from "./use-store-admin-store"

export function clearSession() {
  useAuthStore.getState().clearAuth()
  useStoreAdminStore.getState().clearStoreAdmin()
  useColdStorageStore.getState().clearColdStorage()
  usePreferencesStore.getState().clearPreferences()
}
