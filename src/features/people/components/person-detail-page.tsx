import { Link } from "@tanstack/react-router"
import { ArrowLeft, MapPin, Phone, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { PersonDetailSearch } from "@/features/people/search"

type PersonDetailPageProps = {
  linkId: string
  search: PersonDetailSearch
}

export function PersonDetailPage({ linkId, search }: PersonDetailPageProps) {
  const displayName = search.name?.trim() || "Farmer"
  const accountLabel =
    typeof search.accountNumber === "number"
      ? `Account #${search.accountNumber}`
      : "Account"

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

      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <User className="size-5 text-primary" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              {accountLabel}
            </p>

            {search.mobileNumber ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
                <Phone
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="tabular-nums">{search.mobileNumber}</span>
              </p>
            ) : null}

            {search.address ? (
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <MapPin
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span>{search.address}</span>
              </p>
            ) : null}

            <p className="mt-4 text-xs text-muted-foreground">
              Link ID: <span className="font-mono">{linkId}</span>
            </p>
          </div>
        </div>
      </div>

      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <User />
          </EmptyMedia>

          <EmptyTitle>Farmer detail coming soon</EmptyTitle>

          <EmptyDescription>
            Incoming, dispatch ledger, and account tabs for this farmer will
            appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  )
}
