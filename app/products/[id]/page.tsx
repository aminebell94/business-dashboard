"use client";

import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/api";
import { MinimalistCard } from "@/components/ui/minimalist-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  console.log("ProductDetailPage - ID from params:", id);

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      console.log("Fetching product with ID:", id);
      const result = await getProduct(id);
      console.log("Product fetched:", result);
      return result;
    },
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <MinimalistCard variant="elevated">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </MinimalistCard>
      </div>
    );
  }

  if (error || !product) {
    console.error("Error loading product:", error);
    return (
      <div className="p-6 sm:p-8">
        <QueryError error={error as Error} onRetry={() => refetch()} message="Failed to load product details" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Product Details
          </h1>
        </div>
        <Button asChild>
          <Link href={`/products/${id}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Product
          </Link>
        </Button>
      </div>

      {/* Product Details */}
      <MinimalistCard variant="elevated">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Product Name
            </label>
            <p className="mt-1 text-lg font-medium text-neutral-900 dark:text-neutral-50">
              {product.name || "N/A"}
            </p>
          </div>

          {/* SKU */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              SKU
            </label>
            <p className="mt-1 text-base text-neutral-700 dark:text-neutral-300">
              {product.sku || "N/A"}
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Price
            </label>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              €{Number(product.price || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Stock
            </label>
            <p className="mt-1 text-base text-neutral-700 dark:text-neutral-300">
              {product.stock ?? "N/A"} units
            </p>
          </div>

          {/* Created Date */}
          {product.createdAt && (
            <div>
              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Created
              </label>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(product.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </MinimalistCard>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
        <Button asChild>
          <Link href={`/products/${id}/edit`}>Edit Product</Link>
        </Button>
      </div>
    </div>
  );
}
