import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IncomingForm } from "@/features/incoming/forms/incoming-form"
import { usePreferencesStore } from "@/features/auth/store/use-preferences-store"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import {
  getBagSizesForCommodity,
  getCommodityByName,
  getDefaultCommodityName,
} from "@/features/incoming/utils/incoming-preferences"
import { useFarmerStorageLinks } from "@/features/people/api/use-farmer-storage-links"
import { useNextGatePassNumber } from "@/hooks/use-next-gate-pass-number"

const CreateIncomingForm = () => {
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const {
    data: farmerStorageLinks,
    isLoading: isFarmersLoading,
    isError: isFarmersError,
    error: farmersError,
  } = useFarmerStorageLinks()
  const {
    nextNumber,
    isLoading: isGatePassNoLoading,
    isError: isGatePassNoError,
    error: gatePassNoError,
    refetch: refetchGatePassNo,
  } = useNextGatePassNumber("incoming")
  const gatePassNoReady =
    nextNumber != null && !isGatePassNoLoading && !isGatePassNoError
  const preferences = usePreferencesStore((s) => s.preferences)
  const commodities = useMemo(
    () => preferences?.commodities ?? [],
    [preferences?.commodities]
  )

  const defaultCommodityName = useMemo(
    () => getDefaultCommodityName(commodities),
    [commodities]
  )
  const initialBagSizes = useMemo(
    () =>
      getBagSizesForCommodity(
        getCommodityByName(commodities, defaultCommodityName)
      ),
    [commodities, defaultCommodityName]
  )

  if (!userId || isGatePassNoLoading || nextNumber == null) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-4 pb-6 sm:px-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4 px-4 pt-6 pb-6 sm:px-6">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <IncomingForm
      mode="create"
      gatePassNo={nextNumber}
      gatePassNoReady={gatePassNoReady}
      gatePassNoLoading={isGatePassNoLoading}
      gatePassNoError={gatePassNoError}
      onRefetchGatePassNo={() => void refetchGatePassNo()}
      userId={userId}
      initialCommodity={defaultCommodityName}
      initialBagSizes={initialBagSizes}
      farmerStorageLinks={farmerStorageLinks}
      isFarmersLoading={isFarmersLoading}
      isFarmersError={isFarmersError}
      farmersError={farmersError}
    />
  )
}

export default CreateIncomingForm
