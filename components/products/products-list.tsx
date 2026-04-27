// components/products/products-list.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { listProducts } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { MinimalistCard } from "@/components/ui/minimalist-card";
import { QueryError } from "@/components/ui/query-error";
import { Plus } from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

type ProductRow = {
  id?: string | number;
  documentId?: string;
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  createdAt?: string;
  attributes?: {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
    createdAt?: string;
  };
};

export default function ProductsList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // can be either { products, total } or { data, meta }
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    // listProducts accepts { page, pageSize, search }
    listProducts({ page, pageSize, search })
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message ?? "Failed to load products");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [page, pageSize, search]);

  // Normalize list + total from either shape
  const products: ProductRow[] = useMemo(() => {
    if (Array.isArray(data?.products)) return data.products as ProductRow[];
    if (Array.isArray(data?.data)) return data.data as ProductRow[];
    return [];
  }, [data]);

  const total: number = useMemo(() => {
    if (typeof data?.total === "number") return data.total;
    const t = data?.meta?.pagination?.total;
    return typeof t === "number" ? t : products.length;
  }, [data, products.length]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Local client-side filtering (keeps working even if backend search isn't wired)
  const filtered = useMemo(() => {
    const q = (search ?? "").toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p?.name ?? p?.attributes?.name ?? "").toString().toLowerCase();
      const sku = (p?.sku ?? p?.attributes?.sku ?? "").toString().toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [products, search]);

  if (loading) {
    return (
      <MinimalistCard variant="elevated" padding="md">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-full sm:w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </MinimalistCard>
    );
  }

  if (err) {
    return (
      <QueryError 
        error={new Error(err)} 
        onRetry={() => {
          setErr(null);
          setLoading(true);
          listProducts({ page, pageSize, search })
            .then((res) => setData(res))
            .catch((e: any) => setErr(e?.message ?? "Failed to load products"))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <MinimalistCard variant="elevated" padding="none" className="overflow-hidden">
      {/* Header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          All Products
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <SearchInput
            placeholder="Search by name or SKU…"
            value={search}
            onChange={setSearch}
            className="flex-1 sm:flex-initial sm:w-64"
          />
          <Button onClick={() => (window.location.href = "/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-neutral-500 dark:text-neutral-400 py-12">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const id = String(p.documentId ?? p.id ?? "");
                const name = p.name ?? p.attributes?.name ?? "-";
                const sku = p.sku ?? p.attributes?.sku ?? "-";
                const price = toCurrency(p.price ?? p.attributes?.price);
                const stock = Number(p.stock ?? p.attributes?.stock ?? 0);
                const created =
                  p.createdAt ?? p.attributes?.createdAt
                    ? new Date(p.createdAt ?? (p.attributes as any)?.createdAt).toLocaleDateString('fr-FR')
                    : "-";

                return (
                  <TableRow 
                    key={id || name + sku}
                    className="transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-neutral-900 dark:text-neutral-50">
                      {name}
                    </TableCell>
                    <TableCell className="text-neutral-500 dark:text-neutral-400">
                      {sku}
                    </TableCell>
                    <TableCell className="text-neutral-900 dark:text-neutral-50">
                      {price}
                    </TableCell>
                    <TableCell className="text-neutral-900 dark:text-neutral-50">
                      {stock}
                    </TableCell>
                    <TableCell className="text-neutral-500 dark:text-neutral-400">
                      {created}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/products/${id || "unknown"}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = `/products/${id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing {filtered.length > 0 ? ((page - 1) * pageSize) + 1 : 0} - {Math.min(page * pageSize, total)} of {total} products
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </MinimalistCard>
  );
}

function toCurrency(n?: number) {
  const value = Number(n ?? 0);
  return value.toLocaleString('fr-FR', { style: "currency", currency: "EUR" });
}
