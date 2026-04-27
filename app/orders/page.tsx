"use client"

import OrdersList from "@/components/orders/orders-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">Orders</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">Manage and track all your customer orders.</p>
        </div>

        <OrdersList />
      </div>
    </ProtectedRoute>
  )
}
