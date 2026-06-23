import * as React from "react"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useColdStorageStore } from "@/features/auth/store/use-cold-storage-store"
import {
  buildFarmerStockLedgerPdfData,
  type BuildFarmerStockLedgerPdfDataInput,
} from "@/features/people-report/utils/build-farmer-stock-ledger-pdf-data"
import { buildFarmerReportFilterSummaryLines } from "@/features/people-report/utils/build-farmer-report-filter-summary"
import {
  openExcelPreviewInNewTab,
  revokeExcelPreviewUrls,
  type ExcelPreviewUrls,
} from "@/lib/excel-preview-tab"
import { preloadExcelJS } from "@/lib/load-exceljs"

export type BuildFarmerStockLedgerExcelDataInput =
  BuildFarmerStockLedgerPdfDataInput & {
    appliedFrom?: string
    appliedTo?: string
  }

type FarmerStockLedgerExcelButtonProps = {
  getExcelBuildInput: () => BuildFarmerStockLedgerExcelDataInput | null
  disabled?: boolean
}

export function FarmerStockLedgerExcelButton({
  getExcelBuildInput,
  disabled = false,
}: FarmerStockLedgerExcelButtonProps) {
  const [isGeneratingExcel, setIsGeneratingExcel] = React.useState(false)
  const getExcelBuildInputRef = React.useRef(getExcelBuildInput)
  const previewUrlsRef = React.useRef<ExcelPreviewUrls | null>(null)
  const generatingExcelRef = React.useRef(false)

  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name)
  const coldStorageAddress = useColdStorageStore(
    (state) => state.coldStorage?.address,
  )

  React.useEffect(() => {
    getExcelBuildInputRef.current = getExcelBuildInput
  }, [getExcelBuildInput])

  React.useEffect(() => {
    return () => {
      revokeExcelPreviewUrls(previewUrlsRef.current)
      previewUrlsRef.current = null
    }
  }, [])

  const handleGenerate = React.useCallback(async () => {
    if (generatingExcelRef.current) return

    const buildInput = getExcelBuildInputRef.current()
    if (!buildInput || !coldStorageName) {
      toast.error("Report data is not ready yet.")
      return
    }

    try {
      generatingExcelRef.current = true
      setIsGeneratingExcel(true)

      const excelModulePromise = import(
        "@/features/people-report/utils/build-farmer-stock-ledger-excel"
      )
      const excelJsPromise = preloadExcelJS()

      const reportData = buildFarmerStockLedgerPdfData(buildInput)
      const { appliedFrom, appliedTo, grouping = [] } = buildInput
      const filterSummaryLines = buildFarmerReportFilterSummaryLines({
        appliedFrom,
        appliedTo,
        grouping,
      })

      await openExcelPreviewInNewTab(previewUrlsRef, async () => {
        await excelJsPromise
        const { buildFarmerStockLedgerExcelPackage } = await excelModulePromise

        const result = await buildFarmerStockLedgerExcelPackage({
          reportData,
          coldStorageName,
          coldStorageAddress,
          filterSummaryLines,
        })

        return {
          buffer: result.buffer,
          fileName: result.fileName,
          preview: result.preview,
        }
      })

      toast.success("Excel preview opened")
    } catch {
      // openExcelPreviewInNewTab already alerted
    } finally {
      generatingExcelRef.current = false
      setIsGeneratingExcel(false)
    }
  }, [coldStorageAddress, coldStorageName])

  return (
    <Button
      type="button"
      size="sm"
      className="min-h-9 shrink-0"
      disabled={disabled || isGeneratingExcel || !coldStorageName}
      onClick={() => void handleGenerate()}
    >
      {isGeneratingExcel ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 size-4" />
          Excel
        </>
      )}
    </Button>
  )
}
