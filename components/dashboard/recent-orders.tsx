"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import  StatusChip  from "@/components/ui/status-chip"
import type { Order } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Recent Orders</CardTitle>
          <CardDescription className="text-muted-foreground">Latest orders from your customers</CardDescription>
        </div>
        <Button variant="outline"  asChild>
          <Link href="/orders" className="flex items-center gap-2">
            View All
            <span>→</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 5).map((order) => (
              <TableRow key={order.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  <Link href={`/orders/${order.id}`} className="hover:text-primary transition-colors">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.customer.name}</TableCell>
                <TableCell>
                  <StatusChip status={order.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  €{order.total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
