import { Item, ItemActions, ItemContent, ItemMedia } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

import { PeopleCardSkeleton } from "./people-card"

export function PeoplePageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>

        <ItemContent>
          <Skeleton className="h-5 w-32" />
        </ItemContent>

        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <Skeleton className="h-11 w-full rounded-md" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Skeleton className="h-10 w-full rounded-md sm:w-[150px]" />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PeopleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
