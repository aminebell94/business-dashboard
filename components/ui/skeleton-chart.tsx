import { Skeleton } from './skeleton'

interface SkeletonChartProps {
  type?: 'bar' | 'line' | 'donut'
  showTitle?: boolean
  showLegend?: boolean
}

export function SkeletonChart({
  type = 'bar',
  showTitle = true,
  showLegend = false
}: SkeletonChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      {/* Chart Title */}
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      {/* Chart Area */}
      <div className="space-y-2">
        {type === 'bar' && (
          <div className="flex items-end justify-between gap-2 h-64">
            {Array.from({ length: 7 }).map((_, i) => {
              const height = Math.random() * 60 + 40 // Random height between 40-100%
              return (
                <Skeleton
                  key={i}
                  className="w-full"
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        )}
        
        {type === 'line' && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <div className="flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-12" />
              ))}
            </div>
          </div>
        )}
        
        {type === 'donut' && (
          <div className="flex items-center justify-center py-8">
            <Skeleton variant="circular" className="h-48 w-48" />
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}
      
      {/* Chart Footer Stats */}
      <div className="flex gap-6 pt-2 border-t border-border">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
}
