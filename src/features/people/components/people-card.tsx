import { Link } from "@tanstack/react-router"
import { MapPin, Phone, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatInr } from "@/features/finances/shared/format-currency"
import type { FarmerStorageLink } from "@/features/people/types"
import {
  getLinkDisplayAddress,
  getLinkDisplayMobileNumber,
  getLinkDisplayName,
} from "@/features/people/utils/get-link-display-fields"
import { cn } from "@/lib/utils"

type PeopleCardProps = {
  link: FarmerStorageLink
}

export function PeopleCard({ link }: PeopleCardProps) {
  const name = getLinkDisplayName(link)
  const address = getLinkDisplayAddress(link)
  const mobileNumber = getLinkDisplayMobileNumber(link)

  return (
    <Link
      to="/people/$id"
      params={{ id: link._id }}
      search={{
        name,
        mobileNumber,
        accountNumber: link.accountNumber,
        address,
        tab: "incoming",
      }}
      className="block min-w-0 rounded-4xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <Card size="sm" className={cn("card-hover gap-0")}>
        <CardHeader className="pb-2">
          <CardTitle className="truncate" title={name}>
            {name}
          </CardTitle>
          <CardDescription className="tabular-nums transition-colors duration-200 group-hover/card:text-foreground/80">
            Account #{link.accountNumber}
          </CardDescription>
          <CardAction>
            <PeopleAvatarIcon />
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Phone
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="tabular-nums">{mobileNumber}</span>
          </p>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <MapPin
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="line-clamp-2" title={address}>
              {address}
            </span>
          </p>

          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 font-normal",
                link.isActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground",
              )}
            >
              {link.isActive ? "Active" : "Inactive"}
            </Badge>

            <p className="min-w-0 truncate text-right text-sm tabular-nums text-foreground">
              <span className="font-medium">{formatInr(link.costPerBag)}</span>
              <span className="text-muted-foreground"> / bag</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PeopleAvatarIcon() {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-xl bg-primary/10",
        "transition-colors duration-200 group-hover/card:bg-primary/15",
      )}
    >
      <User
        className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
        aria-hidden
      />
    </div>
  )
}

export function PeopleCardSkeleton() {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full" />
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
