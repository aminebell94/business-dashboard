'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import type { KPIData } from '@/lib/types'

interface MinimalistKPICardsProps {
  data: KPIData
}

export function MinimalistKPICards({ data }: MinimalistKPICardsProps) {
  const kpis = [
    { title: 'Orders Today', value: data.ordersToday },
    { title: 'Orders (7d)', value: data.orders7d },
    { title: 'Orders (30d)', value: data.orders30d },
    {
      title: 'Revenue Today',
      value: `€${data.revenueToday.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Revenue (7d)',
      value: `€${data.revenue7d.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Revenue (30d)',
      value: `€${data.revenue30d.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <MinimalistCard key={index} variant="elevated" hover className="group">
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            {kpi.title}
          </div>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {kpi.value}
          </div>
        </MinimalistCard>
      ))}
    </div>
  )
}
