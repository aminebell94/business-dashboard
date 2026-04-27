"use client"

import { useState, useEffect } from "react"
import { MinimalistKPICards } from "@/components/dashboard/minimalist-kpi-cards"
import { MinimalistRevenueChart } from "@/components/dashboard/minimalist-revenue-chart"
import { MinimalistOrderStatusChart } from "@/components/dashboard/minimalist-order-status-chart"
import { MinimalistRecentOrdersTable } from "@/components/dashboard/minimalist-recent-orders-table"
import { getKPIData, getRevenueChartData, getOrderStatusChartData, listOrders } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/ui/query-error"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { KPIData, RevenueChartData, OrderStatusChartData, Order } from "@/lib/types"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([])
  const [statusData, setStatusData] = useState<OrderStatusChartData[]>([])
  const [ordersData, setOrdersData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [kpi, revenue, status, orders] = await Promise.all([
        getKPIData(),
        getRevenueChartData(),
        getOrderStatusChartData(),
        listOrders({ pageSize: 5 }),
      ])

      setKpiData(kpi)
      setRevenueData(revenue)
      setStatusData(status)
      setOrdersData(orders.orders)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Error State */}
      {error && !loading && (
        <QueryError error={error} onRetry={fetchData} />
      )}

      {/* KPI Cards */}
      {!error && (loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : kpiData ? (
        <MinimalistKPICards data={kpiData} />
      ) : null)}

      {/* Charts */}
      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-[450px]" />
              <Skeleton className="h-[450px]" />
            </>
          ) : (
            <>
              {revenueData.length > 0 && <MinimalistRevenueChart data={revenueData} />}
              {statusData.length > 0 && <MinimalistOrderStatusChart data={statusData} />}
            </>
          )}
        </div>
      )}

      {/* Recent Orders */}
      {!error && <MinimalistRecentOrdersTable orders={ordersData} loading={loading} />}
    </div>
  )
}

