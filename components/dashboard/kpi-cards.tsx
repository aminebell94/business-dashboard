"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { KPIData } from "@/lib/types"

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: "Orders Today",
      value: data.ordersToday,
      trend: "+12%",
      trendUp: true,
      gradient: "from-primary/10 to-primary/5",
    },
    {
      title: "Orders (7d)",
      value: data.orders7d,
      trend: "+8%",
      trendUp: true,
      gradient: "from-accent/10 to-accent/5",
    },
    {
      title: "Orders (30d)",
      value: data.orders30d,
      trend: "+15%",
      trendUp: true,
      gradient: "from-chart-3/10 to-chart-3/5",
    },
    {
      title: "Revenue Today",
      value: `€${data.revenueToday.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      trend: "+5%",
      trendUp: true,
      gradient: "from-chart-4/10 to-chart-4/5",
    },
    {
      title: "Revenue (7d)",
      value: `€${data.revenue7d.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      trend: "+18%",
      trendUp: true,
      gradient: "from-chart-5/10 to-chart-5/5",
    },
    {
      title: "Revenue (30d)",
      value: `€${data.revenue30d.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      trend: "-2%",
      trendUp: false,
      gradient: "from-secondary/10 to-secondary/5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${kpi.gradient} border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:transform hover:scale-[1.02] group`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {kpi.title}
            </CardTitle>
            <div className="h-5 w-5 rounded bg-primary/20 group-hover:scale-110 transition-transform duration-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {kpi.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={`text-xs mr-1 ${kpi.trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                {kpi.trendUp ? "↗" : "↘"}
              </span>
              <span className={kpi.trendUp ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                {kpi.trend}
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
