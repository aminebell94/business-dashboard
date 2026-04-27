// app/products/new/page.tsx
"use client";

import { useState } from "react";
import { createProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinimalistCard } from "@/components/ui/minimalist-card";

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
      };
      await createProduct(payload);
      // go back to products list
      window.location.href = "/products";
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-6">Create Product</h1>
      <MinimalistCard variant="elevated">
        {err && (
          <div className="mb-4 p-3 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950">
            {err}
          </div>
        )}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g., MacBook Pro 14"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
              placeholder="e.g., LAPTOP-001"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              placeholder="1999.99"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
              placeholder="15"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => (window.location.href = "/products")} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </MinimalistCard>
    </div>
  );
}
