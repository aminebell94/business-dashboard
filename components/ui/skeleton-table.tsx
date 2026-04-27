import { Skeleton } from './skeleton'

interface SkeletonTableProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true
}: SkeletonTableProps) {
  return (
    <div className="w-full">
      <div className="rounded-lg border border-border bg-card">
        {/* Table Header */}
        {showHeader && (
          <div className="border-b border-border bg-muted/50">
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
        )}
        
        {/* Table Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 p-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
