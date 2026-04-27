// components/orders/order-detail.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusChip from "@/components/ui/status-chip";
import { getOrderById } from "@/lib/api";
import { ArrowLeft, Edit, Package } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import { RoleGuard } from "@/components/auth/role-guard";

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const isCreate = !orderId || orderId === "new";

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !isCreate,
    retry: 2,
  });
  console.log("orderResponse", orderResponse)
  // If Strapi returns full response (`{ data }`), unwrap. Some of your other code expects shape directly.
  const order = (orderResponse?.data ?? orderResponse) ?? null;

  if (isCreate) {
    // You can render a create form here, or return null if you use a separate page/component
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Create new order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fill the form to create a new order.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !order) {
    return <QueryError error={error as Error} onRetry={() => refetch()} message="Failed to load order details" />;
  }

  // adapt fields depending on whether order is flattened or Strapi format
  // attempt to read properties robustly
  const orderNumber = order.orderNumber ?? order.attributes?.orderNumber ?? order.order_number ?? "";
  const createdAtRaw = order.createdAt ?? order.attributes?.createdAt ?? order.attributes?.created_at ?? order.created_at;
  const updatedAtRaw = order.updatedAt ?? order.attributes?.updatedAt ?? order.updated_at;
  const customer = order.customer ?? order.attributes?.customer ?? order.customer ?? { name: "", email: "" };
  const items = order.items ?? order.attributes?.items ?? [];

  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const total = order.total ?? order.attributes?.total ?? order.total_price ?? Number(order.attributes?.total_price ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost"  asChild>
            <Link href="/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{orderNumber}</h1>
            <p className="text-muted-foreground">
              Created on {createdAt ? createdAt.toLocaleDateString("fr-FR") : "-"}
            </p>
          </div>
        </div>
        <Button variant="default" asChild>
          <a href={`/orders/${order.documentId ?? order.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChip status={order.orderStatus ?? order.attributes?.orderStatus} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(items ?? []).map((item: any) => {
                  const product = item.product ?? item.attributes?.product ?? item.product?.attributes ?? item.product;
                  const price = item.price ?? item.unit_price ?? item.attributes?.price ?? item.attributes?.unit_price ?? 0;
                  const qty = item.quantity ?? item.attributes?.quantity ?? 1;
                  const id = item.id ?? item._id ?? `${product?.id ?? "p"}-${Math.random().toString(36).slice(2, 7)}`;

                  return (
                    <div key={id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{product?.name ?? product?.attributes?.name ?? "Product"}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product?.sku ?? product?.attributes?.sku ?? "-"}</p>
                        <p className="text-sm text-muted-foreground">
                          €{Number(price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} × {qty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          €{(Number(price) * Number(qty)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    €{Number(total).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-foreground">{customer?.name ?? "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{customer?.email ?? "-"}</p>
              </div>
              {customer?.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-foreground">{customer.phone}</p>
                </div>
              )}
              {customer?.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-foreground text-pretty">{customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground">{(items ?? []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground">{createdAt ? createdAt.toLocaleDateString("fr-FR") : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{updatedAt ? updatedAt.toLocaleDateString("fr-FR") : "-"}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">
                    €{Number(total).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
