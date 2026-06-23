import { useState, useCallback } from "react"
import { pdf } from "@react-pdf/renderer"
import { FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useColdStorageStore } from "@/features/auth/store/use-cold-storage-store"
import FarmerStockLedgerReport from "@/features/people-report/pdf/farmer-stock-ledger-report-pdf"
import {
  buildFarmerStockLedgerPdfData,
  type BuildFarmerStockLedgerPdfDataInput,
  type FarmerStockLedgerPdfData,
} from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"

type FarmerStockLedgerPdfButtonProps = {
  getPdfBuildInput: () => BuildFarmerStockLedgerPdfDataInput | null
  disabled?: boolean
}

export function FarmerStockLedgerPdfButton({
  getPdfBuildInput,
  disabled = false,
}: FarmerStockLedgerPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name)
  const coldStorageAddress = useColdStorageStore(
    (state) => state.coldStorage?.address,
  )
  const coldStorageLogo = useColdStorageStore(
    (state) => state.coldStorage?.imageUrl,
  )

  const handleOpenPdf = useCallback(async () => {
    const buildInput = getPdfBuildInput()
    if (!buildInput || !coldStorageName) {
      toast.error("Report data is not ready yet.")
      return
    }

    try {
      setIsGenerating(true)

      const pdfData: FarmerStockLedgerPdfData = buildFarmerStockLedgerPdfData({
        ...buildInput,
        generatedAt: new Date(),
      })

      const doc = (
        <FarmerStockLedgerReport
          {...pdfData}
          coldStorageName={coldStorageName}
          coldStorageAddress={coldStorageAddress}
          coldStorageLogo={coldStorageLogo || undefined}
        />
      )
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()

      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [
    coldStorageAddress,
    coldStorageLogo,
    coldStorageName,
    getPdfBuildInput,
  ])

  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0"
      onClick={() => void handleOpenPdf()}
      disabled={disabled || isGenerating || !coldStorageName}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <FileDown className="mr-2 size-4" />
          PDF
        </>
      )}
    </Button>
  )
}
