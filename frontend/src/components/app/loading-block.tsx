import { Skeleton } from "@/components/ui/skeleton"

export function LoadingBlock() {
  return (
    <div className="space-y-4 rounded-xl bg-card p-6 ledger-shadow ledger-ghost-border">
      <Skeleton className="h-6 w-56 rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-2/3 rounded-md" />
    </div>
  )
}
