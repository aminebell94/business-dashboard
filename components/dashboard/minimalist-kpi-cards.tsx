'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIData } from '@/lib/types'

interface MinimalistKPICardsProps {
  data: KPIData
}

export function MinimalistKPICards({ data }: MinimalistKPICardsProps) {
  const kpis = [
    {
      title: 'Orders Today',
      value: data.ordersToday,
      trend: { value: '+12%', direction: 'up' as const }
    },
    {
      title: 'Orders (7d)',
      value: data.orders7d,
      trend: { value: '+8%', direction: 'up' as const }
    },
    {
      title: 'Orders (30d)',
      value: data.orders30d,
      trend: { value: '+15%', direction: 'up' as const }
    },
    {
      title: 'Revenue Today',
      value: `€${data.revenueToday.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
      trend: { value: '+5%', direction: 'up' as const }
    },
    {
      title: 'Revenue (7d)',
      value: `€${data.revenue7d.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
      trend: { value: '+18%', direction: 'up' as const }
    },
    {
      title: 'Revenue (30d)',
      value: `€${data.revenue30d.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
      trend: { value: '-2%', direction: 'down' as const }
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <MinimalistCard
          key={index}
          variant="elevated"
          hover
          className="group"
        >
          {/* Title */}
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            {kpi.title}
          </div>
          
          {/* Value */}
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2 tracking-tight">
            {kpi.value}
          </div>
          
          {/* Trend */}
          <div className="flex items-center gap-1.5">
            {kpi.trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                kpi.trend.direction === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {kpi.trend.value}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              from last period
            </span>
          </div>
        </MinimalistCard>
      ))}
    </div>
  )
}
