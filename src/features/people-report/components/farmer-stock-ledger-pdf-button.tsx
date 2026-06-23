import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useColdStorageStore } from "@/features/auth/store/use-cold-storage-store"
import FarmerStockLedgerReport from "@/features/people-report/pdf/farmer-stock-ledger-report-pdf"
import type { FarmerStockLedgerPdfData } from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"

type FarmerStockLedgerPdfButtonProps = {
  pdfData: FarmerStockLedgerPdfData | null
  disabled?: boolean
}

export function FarmerStockLedgerPdfButton({
  pdfData,
  disabled = false,
}: FarmerStockLedgerPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const coldStorage = useColdStorageStore((state) => state.coldStorage)

  const handleOpenPdf = async () => {
    if (!pdfData || !coldStorage?.name) {
      toast.error("Report data is not ready yet.")
      return
    }

    try {
      setIsGenerating(true)

      const doc = (
        <FarmerStockLedgerReport
          {...pdfData}
          coldStorageName={coldStorage.name}
          coldStorageAddress={coldStorage.address}
          coldStorageLogo={coldStorage.imageUrl || undefined}
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
  }

  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0"
      onClick={() => void handleOpenPdf()}
      disabled={disabled || isGenerating || !pdfData}
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
