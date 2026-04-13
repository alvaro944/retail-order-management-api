import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()

  if (normalized === "CANCELLED") {
    return (
      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
        Cancelled
      </Badge>
    )
  }

  if (normalized === "LOW") {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        Low stock
      </Badge>
    )
  }

  return (
    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
      {normalized === "CREATED" ? "Created" : "Healthy"}
    </Badge>
  )
}
