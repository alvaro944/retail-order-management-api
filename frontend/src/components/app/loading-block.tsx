import { Skeleton } from "@/components/ui/skeleton"

export function LoadingBlock() {
  return (
    <div className="ledger-panel space-y-6 p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-24 rounded-[1.25rem]" />
        <Skeleton className="h-24 rounded-[1.25rem]" />
        <Skeleton className="h-24 rounded-[1.25rem]" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-2/3 rounded-xl" />
      </div>
    </div>
  )
}
