import { useMemo, useState } from "react"
import { Plus, Receipt, RefreshCw, Search, Wallet, X } from "lucide-react"

import { DatePickerInput } from "@/components/date-picker"
import {
  filterAndSortOptions,
  SearchableOptionCombobox,
} from "@/components/searchable-option-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { useLedgers } from "@/features/finances/api/use-ledgers"
import { useVouchers } from "@/features/finances/api/use-vouchers"
import type { VoucherFilters } from "@/features/finances/types"
import { buildDateRangeFilters } from "@/features/finances/utils/date-filters"
import { mapLedgersToComboboxOptions } from "@/features/finances/utils/ledger-options"
import { cn } from "@/lib/utils"

import { AddVoucherDialog } from "./add-voucher-dialog"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { VouchersError } from "./vouchers-error"
import { VouchersSkeleton } from "./vouchers-skeleton"

type ComboboxUiState = {
  search: string
  open: boolean
}

const emptyComboboxState = (): ComboboxUiState => ({
  search: "",
  open: false,
})

const VoucherTab = () => {
  const [search, setSearch] = useState("")
  const [addVoucherOpen, setAddVoucherOpen] = useState(false)
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [ledgerIdDraft, setLedgerIdDraft] = useState("")
  const [ledgerCombobox, setLedgerCombobox] = useState(emptyComboboxState)
  const [appliedFilters, setAppliedFilters] = useState<VoucherFilters>({})

  const { ledgers } = useLedgers()
  const { vouchers, isLoading, isFetching, isError, error, refetch } =
    useVouchers(appliedFilters)

  const ledgerFilterOptions = useMemo(
    () => mapLedgersToComboboxOptions(ledgers),
    [ledgers]
  )

  const sortedLedgerOptions = useMemo(
    () => filterAndSortOptions(ledgerCombobox.search, ledgerFilterOptions),
    [ledgerCombobox.search, ledgerFilterOptions]
  )

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...buildDateRangeFilters(fromDate, toDate),
      ...(ledgerIdDraft ? { ledgerId: ledgerIdDraft } : {}),
    })
  }

  const handleResetFilters = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setLedgerIdDraft("")
    setLedgerCombobox(emptyComboboxState())
    setAppliedFilters({})
  }

  const showInitialSkeleton = isLoading && vouchers.length === 0
  const hasDraftFilters = Boolean(fromDate || toDate || ledgerIdDraft)
  const hasAppliedFilters = Boolean(
    appliedFilters.from || appliedFilters.to || appliedFilters.ledgerId
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {vouchers.length} voucher
            {vouchers.length === 1 ? "" : "s"}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vouchers…"
            className="w-full pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
              <DatePickerInput
                id="vouchers-from"
                placeholder="From"
                value={fromDate}
                onChange={setFromDate}
                className="min-w-0 sm:w-38"
              />

              <DatePickerInput
                id="vouchers-to"
                placeholder="To"
                value={toDate}
                onChange={setToDate}
                className="min-w-0 sm:w-38"
              />
            </div>

            <div className="min-w-0 sm:w-46">
              <SearchableOptionCombobox
                id="vouchers-ledger-filter"
                name="ledgerFilter"
                value={ledgerIdDraft}
                onValueChange={setLedgerIdDraft}
                onBlur={() => {}}
                isInvalid={false}
                placeholder="All ledgers"
                emptyMessage={
                  ledgerFilterOptions.length === 0
                    ? "No ledgers available."
                    : "No ledgers found."
                }
                options={ledgerFilterOptions}
                sortedOptions={sortedLedgerOptions}
                search={ledgerCombobox.search}
                setSearch={(search) =>
                  setLedgerCombobox((current) => ({ ...current, search }))
                }
                open={ledgerCombobox.open}
                setOpen={(open) =>
                  setLedgerCombobox((current) => ({ ...current, open }))
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="min-w-18"
                onClick={handleApplyFilters}
                disabled={!hasDraftFilters && !hasAppliedFilters}
              >
                Apply
              </Button>
              {(hasDraftFilters || hasAppliedFilters) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleResetFilters}
                >
                  <X className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-row">
            <Button
              type="button"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={() => setAddVoucherOpen(true)}
            >
              <Plus className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add New</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={() => {}}
            >
              <Wallet className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">General Expense</span>
            </Button>
          </div>
        </div>
      </div>

      {showInitialSkeleton ? (
        <VouchersSkeleton />
      ) : isError ? (
        <VouchersError
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <DataTable columns={columns} data={vouchers} search={search} />
      )}

      <AddVoucherDialog
        open={addVoucherOpen}
        onOpenChange={setAddVoucherOpen}
        ledgerOptions={ledgerFilterOptions}
      />
    </div>
  )
}

export default VoucherTab
