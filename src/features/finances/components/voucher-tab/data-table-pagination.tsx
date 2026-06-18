import { useMemo } from "react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const

type PaginationItemValue = number | "ellipsis"

function getPaginationItems(
  pageIndex: number,
  pageCount: number
): PaginationItemValue[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index)
  }

  const visiblePages = Array.from(
    new Set([0, pageIndex - 1, pageIndex, pageIndex + 1, pageCount - 1])
  )
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b)

  return visiblePages.reduce<PaginationItemValue[]>((items, page) => {
    const previousPage = items[items.length - 1]

    if (typeof previousPage === "number") {
      if (page - previousPage === 2) {
        items.push(previousPage + 1)
      } else if (page - previousPage > 2) {
        items.push("ellipsis")
      }
    }

    items.push(page)
    return items
  }, [])
}

interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalRows: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = Math.max(Math.ceil(totalRows / pageSize), 1)
  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1
  const pageItems = useMemo(
    () => getPaginationItems(pageIndex, pageCount),
    [pageCount, pageIndex]
  )
  const rangeStart =
    totalRows === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRows)
  const rangeEnd =
    totalRows === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium tabular-nums text-foreground">
            {rangeStart.toLocaleString("en-IN")}–
            {rangeEnd.toLocaleString("en-IN")}
          </span>{" "}
          of{" "}
          <span className="font-medium tabular-nums text-foreground">
            {totalRows.toLocaleString("en-IN")}
          </span>{" "}
          vouchers
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-18 tabular-nums">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="tabular-nums"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
      </div>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent className="flex-wrap justify-start sm:justify-end">
          <PaginationItem className="hidden sm:list-item">
            <PaginationLink
              href="#"
              aria-label="Go to first page"
              aria-disabled={!canPreviousPage}
              tabIndex={canPreviousPage ? undefined : -1}
              className={cn(
                "size-9",
                !canPreviousPage && "pointer-events-none opacity-50"
              )}
              onClick={(event) => {
                event.preventDefault()
                onPageChange(0)
              }}
            >
              <ChevronsLeft className="size-4" aria-hidden />
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              text="Prev"
              aria-disabled={!canPreviousPage}
              tabIndex={canPreviousPage ? undefined : -1}
              className={cn(
                !canPreviousPage && "pointer-events-none opacity-50"
              )}
              onClick={(event) => {
                event.preventDefault()
                onPageChange(Math.max(pageIndex - 1, 0))
              }}
            />
          </PaginationItem>

          {pageItems.map((item, itemIndex) =>
            typeof item === "number" ? (
              <PaginationItem
                key={`voucher-page-${item}`}
                className="hidden sm:list-item"
              >
                <PaginationLink
                  href="#"
                  isActive={item === pageIndex}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(item)
                  }}
                >
                  {item + 1}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem
                key={`voucher-ellipsis-${itemIndex}`}
                className="hidden sm:list-item"
              >
                <PaginationEllipsis />
              </PaginationItem>
            )
          )}

          <PaginationItem className="sm:hidden">
            <span
              className="flex h-10 min-w-16 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums text-foreground"
              aria-live="polite"
            >
              {pageIndex + 1} / {pageCount}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={!canNextPage}
              tabIndex={canNextPage ? undefined : -1}
              className={cn(!canNextPage && "pointer-events-none opacity-50")}
              onClick={(event) => {
                event.preventDefault()
                onPageChange(Math.min(pageIndex + 1, pageCount - 1))
              }}
            />
          </PaginationItem>

          <PaginationItem className="hidden sm:list-item">
            <PaginationLink
              href="#"
              aria-label="Go to last page"
              aria-disabled={!canNextPage}
              tabIndex={canNextPage ? undefined : -1}
              className={cn(
                "size-9",
                !canNextPage && "pointer-events-none opacity-50"
              )}
              onClick={(event) => {
                event.preventDefault()
                onPageChange(pageCount - 1)
              }}
            >
              <ChevronsRight className="size-4" aria-hidden />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
