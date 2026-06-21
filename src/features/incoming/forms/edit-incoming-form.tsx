import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IncomingForm } from "@/features/incoming/forms/incoming-form"
import { useIncomingDaybookEntry } from "@/features/incoming/api/use-incoming-daybook-entry"
import { incomingDaybookEntryToFormValues } from "@/features/incoming/utils/incoming-daybook-entry-to-form-values"
import { DEFAULT_DAYBOOK_SEARCH } from "@/features/daybook/search"
import { usePreferencesStore } from "@/features/auth/store/use-preferences-store"
import { useStoreAdminStore } from "@/features/auth/store/use-store-admin-store"
import { useFarmerStorageLinks } from "@/features/people/api/use-farmer-storage-links"
import { getLinkDisplayName } from "@/features/people/utils/get-link-display-fields"

type EditIncomingFormProps = {
  gatePassId: string
}

const EditIncomingForm = ({ gatePassId }: EditIncomingFormProps) => {
  const navigate = useNavigate()
  const userId = useStoreAdminStore((s) => s.storeAdmin?._id ?? "")
  const entry = useIncomingDaybookEntry(gatePassId)
  const preferences = usePreferencesStore((s) => s.preferences)
  const commodities = useMemo(
    () => preferences?.commodities ?? [],
    [preferences?.commodities]
  )
  const {
    data: farmerStorageLinks,
    isLoading: isFarmersLoading,
    isError: isFarmersError,
    error: farmersError,
  } = useFarmerStorageLinks()

  const mapped = useMemo(() => {
    if (!entry || !userId || isFarmersLoading) return null

    const editDefaultValues = incomingDaybookEntryToFormValues({
      entry,
      commodities,
      farmerStorageLinks,
      userId,
    })

    const matchedLink = farmerStorageLinks.find(
      (link) => link._id === editDefaultValues.farmerIncomingLinkId
    )

    const initialFarmerSearch = matchedLink
      ? `${getLinkDisplayName(matchedLink)} — Acct #${matchedLink.accountNumber}`
      : entry.farmerStorageLinkId.name

    const farmerLinkWarning =
      !editDefaultValues.farmerIncomingLinkId && !isFarmersLoading
        ? "Could not match farmer account from daybook. Select the correct farmer."
        : undefined

    return {
      editDefaultValues,
      initialSelectedCommodity: editDefaultValues.commodity,
      initialFarmerSearch,
      farmerLinkWarning,
    }
  }, [
    entry,
    userId,
    isFarmersLoading,
    commodities,
    farmerStorageLinks,
  ])

  if (!entry) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-4 pb-6 sm:px-6">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Gate pass not found
          </CardTitle>
          <CardDescription>
            This incoming gate pass is not in the daybook cache. Open it from the
            daybook or search results first.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-6 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({ to: "/daybook", search: DEFAULT_DAYBOOK_SEARCH })
            }
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to daybook
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!userId || isFarmersLoading || !mapped) {
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

  if (entry.status !== "OPEN") {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-4 pb-6 sm:px-6">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Cannot edit closed gate pass
          </CardTitle>
          <CardDescription>
            Only open incoming gate passes can be edited. This pass is{" "}
            {entry.status.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-6 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({ to: "/daybook", search: DEFAULT_DAYBOOK_SEARCH })
            }
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to daybook
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <IncomingForm
      key={gatePassId}
      mode="edit"
      gatePassNo={entry.gatePassNo}
      gatePassNoReady
      userId={userId}
      gatePassId={gatePassId}
      editDefaultValues={mapped.editDefaultValues}
      editBaselineValues={mapped.editDefaultValues}
      originalBagSizes={entry.bagSizes ?? []}
      rentEntryVoucherId={entry.rentEntryVoucherId}
      initialSelectedCommodity={mapped.initialSelectedCommodity}
      initialFarmerSearch={mapped.initialFarmerSearch}
      farmerLinkWarning={mapped.farmerLinkWarning}
      farmerStorageLinks={farmerStorageLinks}
      isFarmersLoading={isFarmersLoading}
      isFarmersError={isFarmersError}
      farmersError={farmersError}
    />
  )
}

export default EditIncomingForm
