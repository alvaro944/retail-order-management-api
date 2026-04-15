import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  detail?: string
  accent?: "default" | "muted" | "danger"
  icon?: ReactNode
}

export function MetricCard({
  label,
  value,
  detail,
  accent = "default",
  icon,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "min-w-0 border-t pt-4 sm:pt-5",
        accent === "danger" && "border-destructive/25",
        accent === "muted" && "border-border/80",
        accent === "default" && "border-foreground/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="ledger-kicker">{label}</p>
          <p className="text-[1.85rem] font-semibold tracking-[-0.05em] text-foreground">{value}</p>
        </div>
        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/90 text-primary ring-1 ring-border/70">
            {icon}
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p> : null}
    </div>
  )
}
