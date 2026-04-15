import type { LucideIcon } from "lucide-react"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ledger-panel ledger-grid flex min-h-72 flex-col items-center justify-center gap-5 overflow-hidden p-8 text-center sm:p-10">
      <div className="flex size-14 items-center justify-center rounded-full bg-card/96 text-primary shadow-[0_10px_24px_-18px_rgba(40,55,69,0.65)]">
        <Icon className="size-5" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
