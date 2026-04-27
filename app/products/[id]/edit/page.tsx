import { ProductForm } from "@/components/products/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Edit Product</h1>
      {/* Pass only the id; the form will fetch & hydrate */}
      <ProductForm mode="edit" initialValues={{ id }} />
    </div>
  );
}
