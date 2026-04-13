import type { LucideIcon } from "lucide-react"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl bg-muted/70 p-10 text-center ledger-ghost-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-card text-primary ledger-shadow">
        <Icon className="size-5" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
