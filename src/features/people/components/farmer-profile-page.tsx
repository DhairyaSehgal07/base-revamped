import { useCallback, useMemo, useState } from "react"
import { getRouteApi, Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditFarmerDialog } from "@/features/people/components/edit-farmer-dialog"
import { FarmerGatePassesSection } from "@/features/people/components/farmer-gate-passes-section"
import {
  FarmerProfileCard,
  type FarmerBagTotals,
} from "@/features/people/components/farmer-profile-card"
import type { PersonDetailSearch } from "@/features/people/search"
import type { FarmerStorageLink } from "@/features/people/types"
import { personDetailSearchToFarmerLink } from "@/features/people/utils/person-detail-search"

const peopleDetailRouteApi = getRouteApi("/_authenticated/people/$id")

const EMPTY_BAG_TOTALS: FarmerBagTotals = {
  incomingGatePasses: 0,
  outgoingGatePasses: 0,
  incomingBags: 0,
  outgoingBags: 0,
  transferIncomingBags: 0,
  transferOutgoingBags: 0,
}

type FarmerProfilePageProps = {
  linkId: string
  search: PersonDetailSearch
}

export function FarmerProfilePage({ linkId, search }: FarmerProfilePageProps) {
  const navigate = peopleDetailRouteApi.useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [bagTotals, setBagTotals] = useState(EMPTY_BAG_TOTALS)
  const [isLoadingTotals, setIsLoadingTotals] = useState(true)

  const editLink = useMemo(
    () => personDetailSearchToFarmerLink(linkId, search),
    [linkId, search],
  )

  const displayName = search.name?.trim() || "Farmer"
  const accountLabel =
    typeof search.accountNumber === "number"
      ? `Account #${search.accountNumber}`
      : "Account"

  const handleSummariesChange = useCallback(
    (totals: FarmerBagTotals, isLoading: boolean) => {
      setBagTotals(totals)
      setIsLoadingTotals(isLoading)
    },
    [],
  )

  const handleEditSuccess = (updatedLink: FarmerStorageLink) => {
    navigate({
      search: (current) => ({
        ...current,
        name: updatedLink.name,
        mobileNumber: updatedLink.mobileNumber,
        accountNumber: updatedLink.accountNumber,
        address: updatedLink.address,
        costPerBag: updatedLink.costPerBag,
      }),
    })
  }

  const handleStockLedgerClick = () => {
    void navigate({
      to: "./report",
      search,
    })
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <FarmerProfileCard
        displayName={displayName}
        accountLabel={accountLabel}
        costPerBag={search.costPerBag}
        mobileNumber={search.mobileNumber}
        address={search.address}
        bagTotals={bagTotals}
        isLoadingTotals={isLoadingTotals}
        onEditClick={editLink ? () => setEditOpen(true) : undefined}
        onStockLedgerClick={handleStockLedgerClick}
      />

      {editLink ? (
        <EditFarmerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          link={editLink}
          onSuccess={handleEditSuccess}
        />
      ) : null}

      <FarmerGatePassesSection
        linkId={linkId}
        onSummariesChange={handleSummariesChange}
      />
    </main>
  )
}
