import { Skeleton } from './skeleton'

interface SkeletonCardProps {
  showHeader?: boolean
  showFooter?: boolean
  lines?: number
}

export function SkeletonCard({
  showHeader = true,
  showFooter = false,
  lines = 3
}: SkeletonCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      )}
    </div>
  )
}
