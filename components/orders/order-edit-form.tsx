"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getOrderForEdit,
  listProducts,
  updateOrderWithItems,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusChip from "@/components/ui/status-chip";
import ProductSelect from "./product-select"; 
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import { toast } from "sonner";

type Line = {
  product?: { id: number; name: string; sku: string; price: number };
  quantity: number;
  unit_price?: number;
};

function toMoney(n: number | undefined) {
  const x = Number(n || 0);
  return x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderEditForm({ orderId }: { orderId: string }) {
  const qc = useQueryClient();
  const router = useRouter();

  // products
  const { data: prodResp, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", { page: 1, pageSize: 100 }],
    queryFn: () => listProducts({ page: 1, pageSize: 100 }),
  });
  const products: Array<{ id: number; name: string; sku: string; price: number }> =
    prodResp?.products ?? [];

  // existing order
  const {
    data: orderResp,
    isLoading: loadingOrder,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order-edit", orderId],
    queryFn: () => getOrderForEdit(orderId),
    retry: 2,
  });

  const row = orderResp?.data;
  const initialLines: Line[] = React.useMemo(() => {
    const items = row?.items ?? [];
    return items.map((it: any) => ({
      product: it?.product
        ? {
            id: it.product.id,
            name: it.product.name,
            sku: it.product.sku,
            price: Number(it.product.price || 0),
          }
        : undefined,
      quantity: Number(it?.quantity || 1),
      unit_price: Number(it?.unit_price ?? it?.product?.price ?? 0),
    }));
  }, [row]);

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState<
    "en_preparation" |
    "produit_non_disponible" |
    "sortie_en_livraison" |
    "probleme_commande" |
    "livree" |
    "reportee" |
    "annulee"
  >("en_preparation");
  const [lines, setLines] = React.useState<Line[]>([]);

  // hydrate form once
  React.useEffect(() => {
    if (!row) return;
    setCustomerName(row.customer_name || "");
    setCustomerPhone(row.customer_phone || "");
    setAddress(row.address || "");
    setOrderStatus((row.orderStatus as any) || "en_preparation");
    setLines(initialLines.length ? initialLines : [{ quantity: 1 }]);
  }, [row, initialLines]);

  const onSelectProduct = (rowIndex: number, productIdOrObj: any) => {
    let product = productIdOrObj as any;
    if (typeof productIdOrObj === "number" || typeof productIdOrObj === "string") {
      const found = products.find((p) => String(p.id) === String(productIdOrObj));
      if (found) product = found;
    }
    setLines((prev) =>
      prev.map((l, i) =>
        i === rowIndex
          ? {
              ...l,
              product,
              unit_price: Number(product?.price ?? 0),
              quantity: l.quantity || 1,
            }
          : l
      )
    );
  };

  const onQuantityChange = (rowIndex: number, val: string) => {
    const qty = Math.max(1, Number(val || 1));
    setLines((prev) => prev.map((l, i) => (i === rowIndex ? { ...l, quantity: qty } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, { quantity: 1 }]);
  const removeLine = (rowIndex: number) =>
    setLines((prev) => prev.filter((_, i) => i !== rowIndex));

  const lineSubtotal = (l: Line) => Number(l.quantity || 0) * Number(l.unit_price ?? l.product?.price ?? 0);
  const orderTotal = lines.reduce((acc, l) => acc + lineSubtotal(l), 0);

  // Check if form has changes from original
  const hasChanges = React.useMemo(() => {
    if (!row) return false;
    
    // Check basic fields
    if (customerName !== (row.customer_name || "")) return true;
    if (customerPhone !== (row.customer_phone || "")) return true;
    if (address !== (row.address || "")) return true;
    if (orderStatus !== (row.orderStatus || "en_preparation")) return true;
    
    // Check if lines changed
    if (lines.length !== initialLines.length) return true;
    
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const initial = initialLines[i];
      
      if (!current.product && !initial.product) continue;
      if (!current.product || !initial.product) return true;
      if (current.product.id !== initial.product.id) return true;
      if (current.quantity !== initial.quantity) return true;
      if (Number(current.unit_price) !== Number(initial.unit_price)) return true;
    }
    
    return false;
  }, [row, customerName, customerPhone, address, orderStatus, lines, initialLines]);

  const canSubmit =
    !!row &&
    customerName.trim().length > 0 &&
    lines.some((l) => l.product && Number(l.quantity) > 0) &&
    hasChanges;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("order not loaded");
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        address: address || undefined,
        orderStatus,
        lines: (lines ?? [])
          .filter((l) => l.product && l.quantity > 0)
          .map((l) => ({
            product: Number(l.product!.id),
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price ?? l.product!.price),
          })),
      };
      return updateOrderWithItems(row.documentId ?? String(row.id), payload);
    },
    onSuccess: (updated: any) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully!");
      const target =
        updated?.documentId ??
        updated?.data?.documentId ??
        updated?.id ??
        updated?.data?.id;
      router.replace(target ? `/orders/${target}` : `/orders`);
    },
    onError: (error: any) => {
      console.error("Order update error:", error);
      
      // Try to extract error message from different possible formats
      let errorMessage = "Failed to update order";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      // Try to parse JSON error if it's a string
      try {
        if (typeof errorMessage === "string" && errorMessage.includes("{")) {
          const parsed = JSON.parse(errorMessage);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          } else if (parsed?.message) {
            errorMessage = parsed.message;
          } else if (parsed?.error?.details?.errors?.[0]?.message) {
            errorMessage = parsed.error.details.errors[0].message;
          }
        }
      } catch (e) {
        // If parsing fails, use the original message
      }
      
      // Replace product IDs with product names in error messages
      if (typeof errorMessage === "string") {
        // Match patterns like "product 123" or "Product ID: 123"
        errorMessage = errorMessage.replace(/product\s+(\d+)/gi, (match, productId) => {
          const product = products.find(p => String(p.id) === String(productId));
          return product ? `product "${product.name}"` : match;
        });
        
        // Match patterns like "Product ID: 123" or "productId: 123"
        errorMessage = errorMessage.replace(/product\s*id\s*:?\s*(\d+)/gi, (match, productId) => {
          const product = products.find(p => String(p.id) === String(productId));
          return product ? `product "${product.name}"` : match;
        });
      }
      
      toast.error(errorMessage);
    },
  });

  if (loadingOrder || loadingProducts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !row) {
    return <QueryError error={error as Error} onRetry={() => refetch()} message="Failed to load order for editing" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit Order</h1>
        <div className="text-sm text-muted-foreground">Total: €{toMoney(orderTotal)}</div>
      </div>

      {/* Customer */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer_name">Name</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={orderStatus} onValueChange={(val) => setOrderStatus(val as any)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue>
                    <StatusChip status={orderStatus} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_preparation">
                    <StatusChip status="en_preparation" />
                  </SelectItem>
                  <SelectItem value="produit_non_disponible">
                    <StatusChip status="produit_non_disponible" />
                  </SelectItem>
                  <SelectItem value="sortie_en_livraison">
                    <StatusChip status="sortie_en_livraison" />
                  </SelectItem>
                  <SelectItem value="probleme_commande">
                    <StatusChip status="probleme_commande" />
                  </SelectItem>
                  <SelectItem value="livree">
                    <StatusChip status="livree" />
                  </SelectItem>
                  <SelectItem value="reportee">
                    <StatusChip status="reportee" />
                  </SelectItem>
                  <SelectItem value="annulee">
                    <StatusChip status="annulee" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-end">
              <div>
                <Label>Product</Label>
                <ProductSelect
                  products={products}
                  value={l.product ? String(l.product.id) : ""}
                  onChange={(val: any) => onSelectProduct(i, val)}
                  placeholder="Search by name or SKU..."
                  className="w-full"
                />
              </div>
              <div>
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => onQuantityChange(i, e.target.value)}
                />
              </div>
              <div>
                <Label>Unit Price</Label>
                <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted text-sm">
                  €{toMoney(l.unit_price ?? l.product?.price ?? 0)}
                </div>
              </div>
              <div>
                <Label>Subtotal</Label>
                <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted text-sm">
                  €{toMoney(lineSubtotal(l))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                >
                  Remove
                </Button>
              </div>
              <Separator className="md:col-span-5" />
            </div>
          ))}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setLines((p) => [...p, { quantity: 1 }])}>
              + Add line
            </Button>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-xl font-semibold">€{toMoney(orderTotal)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.replace(`/orders/${row.documentId ?? row.id}`)}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
