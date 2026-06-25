import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import {
  CHAMBER_SUMMARY_CARD_CONFIG,
  type ChamberSummaryCards,
} from "../utils/build-summary-cards"

type ChamberAnalyticsSummaryCardsProps = {
  cards: ChamberSummaryCards
}

function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  highlight = false,
  valueClassName,
}: {
  label: string
  value: string
  subtext: string
  icon: LucideIcon
  highlight?: boolean
  valueClassName?: string
}) {
  return (
    <Card size="sm" className="card-hover gap-0">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardAction>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-200 group-hover/card:bg-primary/15">
            <Icon
              className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
              aria-hidden
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5">
        <p
          className={cn(
            "font-heading text-2xl font-semibold tracking-tight tabular-nums",
            highlight ? "text-primary" : "text-foreground",
            valueClassName,
          )}
          title={value}
        >
          <span className="line-clamp-2 break-words">{value}</span>
        </p>
        <p className="text-sm text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  )
}

export function isSentinelLabel(label: string): boolean {
  return label.startsWith("(")
}

export function ChamberAnalyticsSummaryCards({
  cards,
}: ChamberAnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CHAMBER_SUMMARY_CARD_CONFIG.map(({ key, icon }) => {
        const card = cards[key]
        const sentinel =
          key === "topChamber" && isSentinelLabel(card.value)

        return (
          <SummaryCard
            key={key}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            icon={icon}
            highlight={card.highlight}
            valueClassName={sentinel ? "text-muted-foreground italic" : undefined}
          />
        )
      })}
    </div>
  )
}

export function ChamberAnalyticsSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CHAMBER_SUMMARY_CARD_CONFIG.map(({ key }) => (
        <Card key={key} size="sm" className="gap-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
            <CardAction>
              <Skeleton className="size-9 rounded-xl" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
