"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listProducts, createOrderWithItems } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MinimalistCard } from "@/components/ui/minimalist-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusChip from "@/components/ui/status-chip";
import ProductSelect from "@/components/orders/product-select";
import { toast } from "sonner";

type Line = {
  product?: { id: number; name: string; sku: string; price: number };
  quantity: number;
  unit_price?: number; // derived from selected product
};

function toMoney(n: number | undefined) {
  const x = Number(n || 0);
  return x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderCreateForm() {
  const qc = useQueryClient();

  // Load products for the select
  const { data: prodResp } = useQuery({
    queryKey: ["products", { page: 1, pageSize: 100 }],
    queryFn: () => listProducts({ page: 1, pageSize: 100 }),
  });

  const products: Array<{ id: number; name: string; sku: string; price: number }> =
    prodResp?.products ?? [];

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState< // your enum keys
    "en_preparation" |
    "produit_non_disponible" |
    "sortie_en_livraison" |
    "probleme_commande" |
    "livree" |
    "reportee" |
    "annulee"
  >("en_preparation");

  const [lines, setLines] = React.useState<Line[]>([
    { quantity: 1 }, // start with one empty line
  ]);

  // ——— Derived totals
  const lineSubtotal = (l: Line) => Number(l.quantity || 0) * Number(l.unit_price || 0);
  const orderTotal = lines.reduce((acc, l) => acc + lineSubtotal(l), 0);

  // ——— Handlers
  const onSelectProduct = (rowIndex: number, productIdOrObj: any) => {
    // ProductSelect might return id or object — normalize to object
    let product = productIdOrObj as any;
    if (typeof productIdOrObj === "number" || typeof productIdOrObj === "string") {
      const found = products.find((p) => String(p.id) === String(productIdOrObj));
      if (found) product = found;
    }

    setLines((prev: any) =>
      prev.map((l: any, i: any) =>
        i === rowIndex
          ? {
            ...l,
            product,
            unit_price: Number(product?.price ?? 0), // lock to product price
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

  const canSubmit =
    customerName.trim().length > 0 &&
    lines.some((l) => l.product && Number(l.quantity) > 0);

  // ——— Submit
  const mutation = useMutation({
    mutationFn: async () => {
      // Build payload the way our API expects
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        address: address || undefined,
        orderStatus,
        lines: lines
          .filter((l) => l.product && Number(l.quantity) > 0)
          .map((l) => ({
            product: Number(l.product!.id),
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price ?? l.product!.price),
          })),
      };
      return createOrderWithItems(payload);
    },
    onSuccess: (created: any) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully!");
      
      const target =
        created?.documentId ??
        created?.data?.documentId ??
        created?.id ??
        created?.data?.id;

      if (target) window.location.replace(`/orders/${target}`);
      else window.location.replace("/orders");
    },
    onError: (error: any) => {
      console.error("Order creation error:", error);
      
      // Try to extract error message from different possible formats
      let errorMessage = "Failed to create order";
      
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Create Order</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">Total: €{toMoney(orderTotal)}</div>
      </div>

      <MinimalistCard variant="elevated">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Customer</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer_name">Name</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+213 ..."
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
              placeholder="Street, city..."
            />
          </div>
        </div>
      </MinimalistCard>

      <MinimalistCard variant="elevated">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Items</h2>
        <div className="space-y-4">
          {lines.map((l, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-end"
            >
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
                {/* Read-only visual: keep users from editing */}
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
            <Button type="button" variant="outline" onClick={addLine}>
              + Add line
            </Button>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">€{toMoney(orderTotal)}</div>
            </div>
          </div>
        </div>
      </MinimalistCard>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => (window.location.href = "/orders")}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </div>
  );
}
