"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProduct, updateProduct, createProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MinimalistCard } from "@/components/ui/minimalist-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProductFormValues = {
  id?: number | string; // numeric id or documentId
  documentId?: number | string; // prefer to use documentId for updates
  sku: string;
  name: string;
  price: number;
  stock: number;
};

type ProductFormProps = {
  mode: "create" | "edit";
  /** If edit, pass at least { id } (can be numeric id OR documentId).
   *  Other fields are optional and will be fetched if missing. */
  initialValues?: Partial<ProductFormValues>;
  className?: string;
};

export function ProductForm({ mode, initialValues, className }: ProductFormProps) {
  const qc = useQueryClient();

  // We keep local form state; it will be hydrated by query data if edit mode.
  const [values, setValues] = useState<ProductFormValues>({
    id: initialValues?.id,
    documentId: initialValues?.documentId,
    sku: initialValues?.sku ?? "",
    name: initialValues?.name ?? "",
    price: Number(initialValues?.price ?? 0),
    stock: Number(initialValues?.stock ?? 0),
  });

  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  const editId = useMemo(
    () => (mode === "edit" ? initialValues?.id : undefined),
    [mode, initialValues?.id]
  );

  // If we're editing, fetch the product (supports numeric id or documentId).
  const { data: fetched, isLoading: isFetching } = useQuery({
    enabled: mode === "edit" && !!editId,
    queryKey: ["product", String(editId ?? "")],
    queryFn: async () => {
      const p = await getProduct(String(editId));
      // getProduct should already unwrap Strapi's shape.
      return {
        id: p?.id ?? editId,
        documentId: p?.documentId,
        sku: p?.sku ?? "",
        name: p?.name ?? "",
        price: Number(p?.price ?? 0),
        stock: Number(p?.stock ?? 0),

      } as ProductFormValues;
    },
  });

  // When fetched, hydrate the form (only for edit mode).
  useEffect(() => {
    if (mode === "edit" && fetched) {
      setValues(fetched);
    }
  }, [mode, fetched]);

  const mutation = useMutation({
    mutationFn: async (v: ProductFormValues) => {
      if (mode === "edit" && v.id != null) {
        return updateProduct(v.documentId || v.id, {
          sku: v.sku,
          name: v.name,
          price: Number(v.price),
          stock: Number(v.stock),
        });
      }
      return createProduct({
        sku: v.sku,
        name: v.name,
        price: Number(v.price),
        stock: Number(v.stock),
      });
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      if (res?.id) {
        qc.invalidateQueries({ queryKey: ["product", String(res.id)] });
      }
      
      toast.success(mode === "edit" ? "Product updated successfully" : "Product created successfully");
      
      // Redirect to details if edit, otherwise back to list
      if (mode === "edit" && (values.id ?? res?.id)) {
        window.location.replace(`/products/${values.id ?? res.id}`);
      } else {
        window.location.replace(`/products`);
      }
    },
    onError: (err: any) => {
      console.error("Save product failed:", err);
      toast.error("Failed to save product", {
        description: err?.message || "Please check your input and try again."
      });
    },
  });

  function validateForm(): boolean {
    const newErrors: Partial<Record<keyof ProductFormValues, string>> = {};

    if (!values.sku || values.sku.trim() === "") {
      newErrors.sku = "SKU is required";
    }

    if (!values.name || values.name.trim() === "") {
      newErrors.name = "Product name is required";
    }

    if (values.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (values.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (validateForm()) {
      mutation.mutate(values);
    }
  }

  function handleChange<K extends keyof ProductFormValues>(key: K, v: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }

  const showSkeleton = mode === "edit" && isFetching && !fetched;

  return (
    <MinimalistCard variant="elevated" padding="lg" className={cn("animate-fade-in", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {mode === "edit" ? "Edit Product" : "Create Product"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {mode === "edit" 
              ? "Update product information below" 
              : "Add a new product to your inventory"}
          </p>
        </div>

        {showSkeleton ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="sku" 
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={values.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g. PHONE-001"
                  className={cn(errors.sku && "border-rose-500 dark:border-rose-500")}
                />
                <FormError message={errors.sku} />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. iPhone 15 Pro"
                  className={cn(errors.name && "border-rose-500 dark:border-rose-500")}
                />
                <FormError message={errors.name} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="price" 
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Price (€)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={Number(values.price)}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                    placeholder="0.00"
                    className={cn(errors.price && "border-rose-500 dark:border-rose-500")}
                  />
                  <FormError message={errors.price} />
                </div>
                <div className="space-y-2">
                  <Label 
                    htmlFor="stock" 
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={Number(values.stock)}
                    onChange={(e) => handleChange("stock", Number(e.target.value))}
                    placeholder="0"
                    className={cn(errors.stock && "border-rose-500 dark:border-rose-500")}
                  />
                  <FormError message={errors.stock} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </>
        )}
      </div>
    </MinimalistCard>
  );
}
