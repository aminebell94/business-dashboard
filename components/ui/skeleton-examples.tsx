/**
 * Skeleton Loading Examples
 * 
 * This file demonstrates how to use the skeleton components
 * for different loading states in the application.
 */

import { Skeleton } from './skeleton'
import { SkeletonCard } from './skeleton-card'
import { SkeletonTable } from './skeleton-table'
import { SkeletonChart } from './skeleton-chart'

// Example 1: KPI Card Loading State
export function SkeletonKPICard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-3">
      <Skeleton className="h-4 w-24" /> {/* Title */}
      <Skeleton className="h-8 w-32" /> {/* Value */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" /> {/* Trend icon */}
        <Skeleton className="h-4 w-16" /> {/* Trend value */}
      </div>
    </div>
  )
}

// Example 2: Dashboard Loading State
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonKPICard />
        <SkeletonKPICard />
        <SkeletonKPICard />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart type="bar" showTitle showLegend={false} />
        <SkeletonChart type="donut" showTitle showLegend />
      </div>
      
      {/* Recent Orders Table */}
      <SkeletonTable rows={5} columns={5} showHeader />
    </div>
  )
}

// Example 3: Form Loading State
export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" /> {/* Textarea */}
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" /> {/* Button */}
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// Example 4: List Item Loading State
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <Skeleton variant="circular" className="h-12 w-12" /> {/* Avatar */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" /> {/* Title */}
        <Skeleton className="h-3 w-1/2" /> {/* Subtitle */}
      </div>
      <Skeleton className="h-8 w-20" /> {/* Action button */}
    </div>
  )
}
