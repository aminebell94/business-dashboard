'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import StatusChip from '@/components/ui/status-chip'
import type { Order } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface MinimalistRecentOrdersTableProps {
  orders: Order[]
  loading?: boolean
}

export function MinimalistRecentOrdersTable({ orders, loading = false }: MinimalistRecentOrdersTableProps) {
  const router = useRouter()

  const handleRowClick = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  if (loading) {
    return (
      <MinimalistCard variant="elevated">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </MinimalistCard>
    )
  }

  return (
    <MinimalistCard variant="elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Recent Orders
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Latest orders from your customers
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders" className="flex items-center gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-neutral-500 dark:text-neutral-400 font-medium">Order</TableHead>
            <TableHead className="text-neutral-500 dark:text-neutral-400 font-medium">Customer</TableHead>
            <TableHead className="text-neutral-500 dark:text-neutral-400 font-medium">Date</TableHead>
            <TableHead className="text-neutral-500 dark:text-neutral-400 font-medium">Status</TableHead>
            <TableHead className="text-right text-neutral-500 dark:text-neutral-400 font-medium">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.slice(0, 5).map((order) => {
            const orderId = (order as any).documentId || order.id;
            return (
              <TableRow
                key={order.id}
                onClick={() => handleRowClick(orderId)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-neutral-900 dark:text-neutral-50">
                  {order.orderNumber}
                </TableCell>
                <TableCell className="text-neutral-700 dark:text-neutral-300">
                  {order.customer?.name || 'N/A'}
                </TableCell>
                <TableCell className="text-neutral-700 dark:text-neutral-300">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <StatusChip status={order.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-neutral-900 dark:text-neutral-50">
                  €{(order.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">
            No orders found
          </p>
        </div>
      )}
    </MinimalistCard>
  )
}
