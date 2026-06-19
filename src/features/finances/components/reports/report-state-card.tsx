import { AlertCircle, FileQuestion, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ReportStateCardProps = {
  variant: "loading" | "error" | "empty"
  title?: string
  message?: string
  className?: string
}

export function ReportStateCard({
  variant,
  title,
  message,
  className,
}: ReportStateCardProps) {
  if (variant === "loading") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex items-center justify-center gap-2 py-12">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {message ?? "Loading report…"}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (variant === "error") {
    return (
      <Card className={cn("border-destructive/40 overflow-hidden", className)}>
        <CardContent className="flex items-center justify-center gap-2 py-12">
          <AlertCircle className="size-4 text-destructive" />
          <p className="text-sm text-destructive">
            {message ?? "Failed to load report"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
        <FileQuestion className="size-5 text-muted-foreground" />
        <p className="font-heading text-base font-semibold text-foreground">
          {title ?? "No data available"}
        </p>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
