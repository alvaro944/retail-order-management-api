import type { ReactNode } from "react"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  meta?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <div className="ledger-reveal overflow-hidden border-b border-border/80 pb-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
        <div className="space-y-3 pl-4 sm:pl-5 lg:pl-0">
          {eyebrow ? <p className="ledger-kicker">{eyebrow}</p> : null}
          <div className="space-y-3">
            <h1 className="max-w-4xl text-[2.1rem] font-semibold leading-[0.96] tracking-[-0.075em] text-foreground sm:text-[3rem]">
              {title}
            </h1>
            <p className="max-w-[62ch] text-sm leading-6 text-muted-foreground sm:text-[0.98rem]">
              {description}
            </p>
          </div>
        </div>

        {(actions || meta) ? (
          <div className="space-y-3 border-t border-border/80 pt-4 sm:pt-5 xl:pl-8">
            {meta ? <div className="ledger-meta flex flex-wrap items-center gap-x-3 gap-y-1">{meta}</div> : null}
            {actions ? <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
