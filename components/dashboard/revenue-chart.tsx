"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueChartData } from "@/lib/types"

interface RevenueChartProps {
  data: RevenueChartData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Revenue Trend</CardTitle>
        <CardDescription className="text-muted-foreground">Daily revenue over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-1 p-4">
          {data.slice(-14).map((item, index) => {
            const height = (item.revenue / maxRevenue) * 250
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="bg-gradient-to-t from-primary to-primary/60 rounded-t-sm min-h-[4px] w-full transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                  style={{ height: `${height}px` }}
                  title={`€${item.revenue.toLocaleString("fr-FR")} on ${new Date(item.date).toLocaleDateString("fr-FR")}`}
                />
                <span className="text-xs text-muted-foreground rotate-45 origin-bottom-left">
                  {new Date(item.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Total: €{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString("fr-FR")}
          </div>
          <div className="text-sm text-muted-foreground">
            Avg: €{Math.round(data.reduce((sum, item) => sum + item.revenue, 0) / data.length).toLocaleString("fr-FR")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
