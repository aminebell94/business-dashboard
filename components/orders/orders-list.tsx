// components/orders/orders-list.tsx
"use client";

import { useEffect, useState } from "react";
import { listOrders } from "@/lib/api";

// If you use shadcn/ui:
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import StatusChip from "@/components/ui/status-chip";
import { RoleGuard } from "@/components/auth/role-guard";

type OrderRow = {
  id?: string;
  documentId?: string;
  orderNumber?: string;
  customer_name?: string;
  orderStatus?: string;
  total_price?: number;
  createdAt?: string;
  items?: any[];
};

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<{ orders: OrderRow[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    listOrders({ page, pageSize })
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.message ?? "Failed to load orders");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => { alive = false; };
  }, [page]);

  if (loading) {
    // simple skeleton
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <QueryError 
        error={new Error(err)} 
        onRetry={() => {
          setErr(null);
          setLoading(true);
          listOrders({ page, pageSize })
            .then((res) => setData(res))
            .catch((e) => setErr(e?.message ?? "Failed to load orders"))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  const orders = (data?.orders ?? []) as OrderRow[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        <Button onClick={() => (window.location.href = "/orders/new")}>Create Order</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No orders yet. Create your first one!
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const key = String(order.documentId ?? order.id ?? Math.random());
              const itemsCount = Array.isArray(order.items) ? order.items.length : 0;

              return (
                <TableRow key={key} className="border-border">
                  <TableCell className="font-medium">
                    {order.orderNumber ?? key.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>{order.customer_name ?? "-"}</TableCell>
                  <TableCell>
                    <StatusChip status={order.orderStatus} />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_price)}</TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>{itemsCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = `/orders/${order.documentId ?? order.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Simple pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function formatCurrency(n?: number) {
  const value = Number(n ?? 0);
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
