import { Fragment, useCallback, useMemo, useState, type ReactNode } from "react"
import { ClipboardList, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TransferAllocationSheet,
  type AllocationSheetTarget,
} from "@/features/transfer-stock/forms/transfer-allocation-sheet"
import { OutgoingAllocationSheet } from "@/features/outgoing/forms/outgoing-allocation-sheet"
import type { VarietyFilterMode } from "@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix"
import type {
  DatePassGroup,
  StorageGatePass,
} from "@/features/transfer-stock/types/storage-gate-pass"
import {
  allocationKey,
  formatLocationShort,
  getBagSlotsForSize,
  getSlotStockLevel,
  isSlotUnavailable,
  slotStockLevelButtonClasses,
  slotUnavailableButtonClasses,
  type BagSlotDetail,
} from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { usePreferencesStore } from "@/features/auth/store/use-preferences-store"
import { getStorageGatePassLotNo } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { cn } from "@/lib/utils"

/** Checkbox + gate pass + manual gate pass + variety/lot columns before size lanes. */
const FIXED_COLUMN_COUNT = 4

function sizeLaneClasses(_columnIndex: number, variant: "head" | "cell") {
  return cn(
    "border-l border-border/60 px-4",
    variant === "head" ? "bg-muted/40 text-center" : "bg-transparent"
  )
}

function stickyHeadClass(
  column: "checkbox" | "gatePassNo" | "manualGatePassNo" | "varietyLot",
  options?: { edge?: boolean }
) {
  return cn(
    "sticky z-20 bg-muted/40 px-2 py-2 align-bottom",
    column === "checkbox" && "left-0 w-11",
    column === "gatePassNo" && "left-11 w-12 min-w-12",
    column === "manualGatePassNo" && "left-[5.75rem] w-14 min-w-14",
    column === "varietyLot" && "left-[9.25rem] w-32 min-w-32",
    options?.edge &&
      "border-r border-border/60 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.04)]"
  )
}

function stickyCellClass(
  column: "checkbox" | "gatePassNo" | "manualGatePassNo" | "varietyLot",
  options?: { edge?: boolean }
) {
  return cn(
    "sticky z-10 bg-background px-2 transition-colors",
    "group-hover/row:bg-muted/20 group-data-[selected=true]/row:bg-primary/[0.04]",
    column === "checkbox" && "left-0 w-11",
    column === "gatePassNo" && "left-11 w-12 min-w-12",
    column === "manualGatePassNo" && "left-[5.75rem] w-14 min-w-14",
    column === "varietyLot" && "left-[9.25rem] w-32 min-w-32",
    options?.edge &&
      "border-r border-border/60 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.04)]"
  )
}

function ColumnHeader({
  children,
  title,
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <span
      className="block whitespace-normal text-center text-[11px] leading-tight font-medium tracking-wide text-muted-foreground"
      title={title}
    >
      {children}
    </span>
  )
}

function LotNoDisplay({ lotNo }: { lotNo: string }) {
  if (lotNo === "—") return null

  const slashIndex = lotNo.indexOf("/")
  if (slashIndex === -1) {
    return (
      <span className="truncate font-mono text-xs tabular-nums text-muted-foreground">
        {lotNo}
      </span>
    )
  }

  const identifier = lotNo.slice(0, slashIndex)
  const total = lotNo.slice(slashIndex + 1)
  const identifierNum = Number(identifier)
  const totalNum = Number(total)

  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {Number.isNaN(identifierNum)
        ? identifier
        : identifierNum.toLocaleString("en-IN")}
      <span className="text-muted-foreground/70">
        {" / "}
        {Number.isNaN(totalNum) ? total : totalNum.toLocaleString("en-IN")}
      </span>
    </span>
  )
}

function GatePassNoCell({ pass }: { pass: StorageGatePass }) {
  return (
    <span className="font-mono text-sm font-medium tabular-nums text-foreground">
      <span className="text-muted-foreground/60">#</span>
      {pass.gatePassNo.toLocaleString("en-IN")}
    </span>
  )
}

function ManualGatePassNoCell({ pass }: { pass: StorageGatePass }) {
  const manual =
    pass.manualParchiNumber?.trim() ||
    (pass.manualGatePassNumber != null
      ? String(pass.manualGatePassNumber)
      : "")

  if (!manual) {
    return <span className="text-sm text-muted-foreground/50">—</span>
  }

  return (
    <span
      className="block truncate font-mono text-sm tabular-nums text-foreground/90"
      title={manual}
    >
      {manual}
    </span>
  )
}

function VarietyLotCell({ pass }: { pass: StorageGatePass }) {
  const preferences = usePreferencesStore((state) => state.preferences)
  const lotNo = useMemo(
    () => getStorageGatePassLotNo(pass, preferences),
    [pass, preferences]
  )
  const variety = pass.variety?.trim()

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {variety ? (
        <span
          className="line-clamp-2 text-sm leading-snug text-foreground"
          title={variety}
        >
          {variety}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground/50">—</span>
      )}
      {lotNo !== "—" ? <LotNoDisplay lotNo={lotNo} /> : null}
    </div>
  )
}

function EmptySeat() {
  return (
    <Button
      type="button"
      variant="outline"
      disabled
      tabIndex={-1}
      className="h-11 min-w-[7.5rem] border-dashed opacity-100"
      aria-hidden
    />
  )
}

function SelectedQuantityBadge({ quantity }: { quantity: number }) {
  return (
    <Badge
      className="pointer-events-none absolute top-0 right-0 z-10 h-5 min-w-7 -translate-y-1/2 translate-x-1/2 border border-background px-1.5 tabular-nums shadow-sm"
      aria-hidden
    >
      {quantity.toLocaleString("en-IN")}
    </Badge>
  )
}

function SlotButton({
  pass,
  sizeName,
  slot,
  selectedQty,
  previouslyIssued = 0,
  allocationMode = "create",
  onClick,
}: {
  pass: StorageGatePass
  sizeName: string
  slot: BagSlotDetail
  selectedQty: number
  previouslyIssued?: number
  allocationMode?: "create" | "edit"
  onClick: () => void
}) {
  const isSelected = selectedQty > 0
  const currentQty = slot.currentQuantity
  const initialQty = slot.initialQuantity
  const isUnavailable =
    allocationMode === "edit"
      ? isSlotUnavailable(currentQty) && previouslyIssued <= 0
      : isSlotUnavailable(currentQty)
  const stockLevel = getSlotStockLevel(currentQty, initialQty)
  const showSelectedBadge = isSelected && !isUnavailable

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isUnavailable}
      onClick={onClick}
      className={cn(
        "relative h-auto min-h-11 min-w-[7.5rem] flex-col items-stretch justify-start gap-0.5 rounded-md px-2 py-1.5 text-left font-normal",
        isUnavailable
          ? slotUnavailableButtonClasses()
          : slotStockLevelButtonClasses(stockLevel, isSelected),
        showSelectedBadge &&
          "border-primary bg-primary/5 ring-2 ring-primary/30 hover:bg-primary/5"
      )}
      aria-label={
        isUnavailable
          ? `${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, no stock remaining`
          : `${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, ${isSelected ? `${selectedQty} of ${currentQty} selected` : `${currentQty} of ${initialQty} bags`}`
      }
    >
      {showSelectedBadge ? (
        <SelectedQuantityBadge quantity={selectedQty} />
      ) : null}
      <span
        className={cn(
          "flex items-center gap-0.5 text-xs",
          isUnavailable ? "text-muted-foreground/75" : "text-muted-foreground"
        )}
      >
        <MapPin className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{formatLocationShort(slot)}</span>
      </span>
      <span
        className={cn(
          "w-full text-right text-sm font-medium tabular-nums",
          isUnavailable ? "text-muted-foreground/80" : "text-foreground"
        )}
      >
        {currentQty.toLocaleString("en-IN")}
        <span
          className={
            isUnavailable ? "text-muted-foreground/60" : "text-muted-foreground"
          }
        >
          {" / "}
          {initialQty.toLocaleString("en-IN")}
        </span>
      </span>
    </Button>
  )
}

function GatePassSizeCell({
  pass,
  sizeName,
  allocations,
  baselineAllocations,
  allocationMode = "create",
  onSlotClick,
}: {
  pass: StorageGatePass
  sizeName: string
  allocations: Record<string, number>
  baselineAllocations?: Record<string, number>
  allocationMode?: "create" | "edit"
  onSlotClick: (
    pass: StorageGatePass,
    sizeName: string,
    slot: BagSlotDetail
  ) => void
}) {
  const slots = getBagSlotsForSize(pass, sizeName)

  if (slots.length === 0) {
    return <EmptySeat />
  }

  return (
    <div className="flex min-w-[7.5rem] flex-col gap-2 overflow-visible pt-1">
      {slots.map((slot) => {
        const key = allocationKey(pass._id, sizeName, slot.bagIndex)
        const selectedQty = allocations[key] ?? 0
        const previouslyIssued = baselineAllocations?.[key] ?? 0
        return (
          <SlotButton
            key={key}
            pass={pass}
            sizeName={sizeName}
            slot={slot}
            selectedQty={selectedQty}
            previouslyIssued={previouslyIssued}
            allocationMode={allocationMode}
            onClick={() => onSlotClick(pass, sizeName, slot)}
          />
        )
      })}
    </div>
  )
}

type TransferGatePassMatrixProps = {
  displayGroups: DatePassGroup[]
  visibleSizes: string[]
  selectedPassIds: Set<string>
  onPassToggle: (passId: string) => void
  allocations: Record<string, number>
  onAllocationChange: (key: string, quantity: number) => void
  onAllocationClear: (key: string) => void
  hasFilteredData?: boolean
  hasActiveFilters?: boolean
  varietyFilterMode?: VarietyFilterMode
  allocationMode?: "create" | "edit"
  baselineAllocations?: Record<string, number>
}

export function TransferGatePassMatrix({
  displayGroups,
  visibleSizes,
  selectedPassIds,
  onPassToggle,
  allocations,
  onAllocationChange,
  onAllocationClear,
  hasFilteredData = true,
  hasActiveFilters = false,
  varietyFilterMode = "single-required",
  allocationMode = "create",
  baselineAllocations = {},
}: TransferGatePassMatrixProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetTarget, setSheetTarget] = useState<AllocationSheetTarget | null>(
    null
  )

  const columnCount = FIXED_COLUMN_COUNT + visibleSizes.length

  const handleSlotClick = useCallback(
    (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => {
      const key = allocationKey(pass._id, sizeName, slot.bagIndex)
      const previouslyIssued = baselineAllocations[key] ?? 0
      const blocked =
        allocationMode === "edit"
          ? isSlotUnavailable(slot.currentQuantity) && previouslyIssued <= 0
          : isSlotUnavailable(slot.currentQuantity)

      if (blocked) return

      setSheetTarget({
        pass,
        sizeName,
        slot,
        allocationKey: key,
        currentQuantity: slot.currentQuantity,
      })
      setSheetOpen(true)
    },
    [allocationMode, baselineAllocations]
  )

  const sheetInitialQty = sheetTarget
    ? allocations[sheetTarget.allocationKey] ?? 0
    : 0
  const sheetPreviouslyIssued = sheetTarget
    ? baselineAllocations[sheetTarget.allocationKey] ?? 0
    : 0

  if (!hasFilteredData) {
    return (
      <Card size="sm" className="overflow-hidden py-0 shadow-sm ring-border/60">
        <CardContent className="px-0 py-0">
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters
                  ? "No matching gate passes"
                  : "No gate passes to show"}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? "Try different filters or clear the search."
                  : varietyFilterMode === "multi-optional"
                    ? "No gate passes match the current filters, or check back when stock is available."
                    : "Choose a variety to display gate passes, or check back when stock is available."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card size="sm" className="overflow-hidden py-0 shadow-sm ring-border/60">
        <CardContent className="overflow-x-auto px-0 py-0">
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 z-10 border-b border-border/60 bg-muted/40 [&_tr]:hover:bg-transparent">
            <TableRow>
              <TableHead
                className={cn("h-11", stickyHeadClass("checkbox"))}
              >
                <span className="sr-only">Select voucher</span>
              </TableHead>
              <TableHead className={cn("h-11", stickyHeadClass("gatePassNo"))}>
                <ColumnHeader title="Gate pass no.">gp</ColumnHeader>
              </TableHead>
              <TableHead
                className={cn("h-11", stickyHeadClass("manualGatePassNo"))}
              >
                <ColumnHeader title="Manual gate pass no.">manual</ColumnHeader>
              </TableHead>
              <TableHead
                className={cn(
                  "h-11",
                  stickyHeadClass("varietyLot", { edge: true })
                )}
              >
                <ColumnHeader title="Variety & lot no.">variety</ColumnHeader>
              </TableHead>
              {visibleSizes.map((sizeName, index) => (
                <TableHead
                  key={sizeName}
                  className={cn(
                    "h-11 px-3 text-muted-foreground",
                    sizeLaneClasses(FIXED_COLUMN_COUNT + index, "head")
                  )}
                >
                  <span className="block w-full whitespace-nowrap text-center text-xs font-medium text-foreground">
                    {sizeName}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayGroups.map((group) => (
              <Fragment key={group.dateKey}>
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columnCount}
                    className="border-b border-border/40 bg-muted/20 px-4 py-2"
                  >
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {group.dateLabel}
                    </span>
                  </TableCell>
                </TableRow>
                {group.passes.map((pass) => (
                  <TableRow
                    key={pass._id}
                    className="group/row border-b border-border/40 transition-colors hover:bg-muted/20"
                    data-selected={selectedPassIds.has(pass._id) || undefined}
                  >
                    <TableCell
                      className={cn(
                        "overflow-visible py-3 align-top",
                        stickyCellClass("checkbox")
                      )}
                    >
                      <Checkbox
                        checked={selectedPassIds.has(pass._id)}
                        onCheckedChange={() => onPassToggle(pass._id)}
                        aria-label={`Select gate pass ${pass.gatePassNo}`}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "overflow-visible py-3 align-top",
                        stickyCellClass("gatePassNo")
                      )}
                    >
                      <GatePassNoCell pass={pass} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "overflow-visible py-3 align-top",
                        stickyCellClass("manualGatePassNo")
                      )}
                    >
                      <ManualGatePassNoCell pass={pass} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "overflow-visible py-3 align-top",
                        stickyCellClass("varietyLot", { edge: true })
                      )}
                    >
                      <VarietyLotCell pass={pass} />
                    </TableCell>
                    {visibleSizes.map((sizeName, index) => (
                      <TableCell
                        key={sizeName}
                        className={cn(
                          "overflow-visible py-3 align-top",
                          sizeLaneClasses(FIXED_COLUMN_COUNT + index, "cell")
                        )}
                      >
                        <GatePassSizeCell
                          pass={pass}
                          sizeName={sizeName}
                          allocations={allocations}
                          baselineAllocations={baselineAllocations}
                          allocationMode={allocationMode}
                          onSlotClick={handleSlotClick}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {allocationMode === "edit" ? (
        <OutgoingAllocationSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          target={sheetTarget}
          initialQuantity={sheetInitialQty}
          previouslyIssued={sheetPreviouslyIssued}
          onApply={onAllocationChange}
          onClear={onAllocationClear}
        />
      ) : (
        <TransferAllocationSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          target={sheetTarget}
          initialQuantity={sheetInitialQty}
          onApply={onAllocationChange}
          onClear={onAllocationClear}
        />
      )}
    </>
  )
}
