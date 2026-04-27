'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import type { RevenueChartData } from '@/lib/types'
import { useMemo } from 'react'

interface MinimalistRevenueChartProps {
  data: RevenueChartData[]
}

export function MinimalistRevenueChart({ data }: MinimalistRevenueChartProps) {
  const chartData = useMemo(() => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
    const displayData = data.slice(-14) // Show last 14 days
    
    return {
      maxRevenue,
      displayData,
      total: data.reduce((sum, item) => sum + item.revenue, 0),
      average: data.length > 0 ? data.reduce((sum, item) => sum + item.revenue, 0) / data.length : 0
    }
  }, [data])

  return (
    <MinimalistCard variant="elevated" className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Revenue Trend
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Daily revenue over the last 14 days
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] flex items-end justify-between gap-2 px-2">
        {chartData.displayData.map((item, index) => {
          // Calculate height as percentage of max value
          const heightPercentage = chartData.maxRevenue > 0 
            ? (item.revenue / chartData.maxRevenue) * 100 
            : 0
          
          // Calculate actual pixel height
          const maxHeight = 300 // matches container height
          const calculatedHeight = (heightPercentage / 100) * maxHeight
          
          // Ensure minimum visibility: 12px for zero values, at least 20px for non-zero
          const height = item.revenue > 0 
            ? Math.max(calculatedHeight, 20) 
            : 12
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1 group relative">
              {/* Bar */}
              <div
                className={`rounded-t w-full transition-all duration-300 hover:opacity-80 ${
                  item.revenue > 0 
                    ? 'bg-neutral-900 dark:bg-neutral-50' 
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{ 
                  height: `${height}px`
                }}
                title={`€${item.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} on ${new Date(item.date).toLocaleDateString('fr-FR')}`}
              />
              
              {/* Date label */}
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                {new Date(item.date).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer with summary stats */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Total: </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            €{chartData.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Avg: </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            €{Math.round(chartData.average).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </MinimalistCard>
  )
}
