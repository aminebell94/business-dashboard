// app/orders/new/page.tsx
"use client"

import NewOrderForm from "@/components/orders/order-create-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function NewOrderPage() {
  return (
    <ProtectedRoute>
      <div className="p-6 sm:p-8">
        <NewOrderForm />
      </div>
    </ProtectedRoute>
  )
}
