"use client"

import { OrderDetail } from "@/components/orders/order-detail"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <OrderDetail orderId={id} />
    </ProtectedRoute>
  )
}
