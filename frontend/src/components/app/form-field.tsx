import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  actions,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
        >
          {label}
        </label>
        {actions}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  )
}
