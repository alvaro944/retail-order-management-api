import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()

  if (normalized === "CANCELLED") {
    return (
      <Badge className="border border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10">
        Cancelled
      </Badge>
    )
  }

  if (normalized === "LOW") {
    return (
      <Badge className="border border-amber-200/70 bg-amber-50 text-amber-900 hover:bg-amber-50">
        Low stock
      </Badge>
    )
  }

  return (
    <Badge className="border border-primary/12 bg-primary/8 text-primary hover:bg-primary/8">
      {normalized === "CREATED" ? "Created" : "Healthy"}
    </Badge>
  )
}
