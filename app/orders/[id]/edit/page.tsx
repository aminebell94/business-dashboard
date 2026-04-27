// app/orders/[id]/edit/page.tsx
"use client"

import type { Metadata } from "next"
import OrderEditForm from "@/components/orders/order-edit-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <OrderEditForm orderId={id} />
    </ProtectedRoute>
  )
}
