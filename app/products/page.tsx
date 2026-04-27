"use client"

import ProductsList from "@/components/products/products-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Products
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Manage your product inventory, pricing, and stock levels.
          </p>
        </div>

        <ProductsList />
      </div>
    </ProtectedRoute>
  )
}
