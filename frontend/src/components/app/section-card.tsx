import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionCardProps = {
  children: ReactNode
  className?: string
  variant?: "primary" | "soft" | "bare"
}

export function SectionCard({
  children,
  className,
  variant = "primary",
}: SectionCardProps) {
  return (
    <div
      className={cn(
        variant === "primary" && "ledger-panel p-4 sm:p-6",
        variant === "soft" && "ledger-panel-soft p-4 sm:p-6",
        variant === "bare" && "ledger-panel-bare px-0 py-4 sm:py-6",
        className,
      )}
    >
      {children}
    </div>
  )
}
