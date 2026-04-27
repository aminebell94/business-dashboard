'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import type { OrderStatusChartData } from '@/lib/types'
import { useMemo } from 'react'

interface MinimalistOrderStatusChartProps {
  data: OrderStatusChartData[]
}

// Monochromatic color scheme using chart colors
const statusColors: Record<string, string> = {
  'En préparation': 'bg-chart-1',
  'Produit non disponible': 'bg-chart-2',
  'Sortie en livraison': 'bg-chart-3',
  'Problème dans la commande': 'bg-chart-4',
  'Livrée': 'bg-chart-5',
  'Reportée': 'bg-chart-1',
  'Annulée': 'bg-chart-2'
}

export function MinimalistOrderStatusChart({ data }: MinimalistOrderStatusChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const maxCount = Math.max(...data.map((d) => d.count), 1)
    
    return {
      total,
      maxCount,
      items: data
    }
  }, [data])

  return (
    <MinimalistCard variant="elevated" className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Orders by Status
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Distribution of order statuses
        </p>
      </div>

      {/* Simple bar chart */}
      <div className="space-y-4">
        {chartData.items.map((item, index) => {
          const widthPercentage = (item.count / chartData.maxCount) * 100
          const colorClass = statusColors[item.status] || 'bg-neutral-400'
          
          return (
            <div key={index} className="space-y-2">
              {/* Status label and count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {item.status}
                </span>
                <span className="text-neutral-900 dark:text-neutral-50 font-semibold">
                  {item.count}
                </span>
              </div>
              
              {/* Bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer with total */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center">
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {chartData.total}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Total Orders
          </div>
        </div>
      </div>
    </MinimalistCard>
  )
}
