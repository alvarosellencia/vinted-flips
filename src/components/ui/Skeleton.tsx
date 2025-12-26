export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-100 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-3 h-3 w-1/2" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
