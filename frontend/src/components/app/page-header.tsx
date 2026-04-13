import type { ReactNode } from "react"

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-card/95 p-6 ledger-shadow ledger-ghost-border lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}
