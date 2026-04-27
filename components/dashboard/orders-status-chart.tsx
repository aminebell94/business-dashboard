"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderStatusChartData } from "@/lib/types"

interface OrdersStatusChartProps {
  data: OrderStatusChartData[]
}

const statusColors = {
  "En préparation": "bg-chart-1",
  "Produit non disponible": "bg-chart-2",
  "Sortie en livraison": "bg-chart-3",
  "Problème dans la commande": "bg-chart-4",
  Livrée: "bg-chart-5",
  Reportée: "bg-orange-500",
  Annulée: "bg-red-500",
}

export function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Orders by Status</CardTitle>
        <CardDescription className="text-muted-foreground">Distribution of order statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Simple donut chart representation */}
        <div className="h-[300px] flex items-center justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-muted/20"></div>
            <div className="absolute inset-6 rounded-full bg-card border-4 border-background flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{total}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
            {/* Status indicators around the circle */}
            {data.map((item, index) => {
              const angle = (index / data.length) * 360
              const radius = 80
              const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius
              const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius

              return (
                <div
                  key={item.status}
                  className="absolute w-4 h-4 rounded-full transform -translate-x-2 -translate-y-2"
                  style={{
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full ${statusColors[item.status as keyof typeof statusColors] || "bg-gray-400"}`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full ${statusColors[item.status as keyof typeof statusColors] || "bg-gray-400"}`}
              />
              <span className="text-muted-foreground truncate">{item.status}</span>
              <span className="text-foreground font-medium ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
