"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct, updateProduct } from "@/lib/api"
import { ProductSchema, type Product } from "@/lib/types"
import { z } from "zod"

interface ProductDrawerProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

const ProductFormSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true })

export function ProductDrawer({ isOpen, onClose, product }: ProductDrawerProps) {
  const isEditing = !!product

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    price: "",
    stock: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
      })
    } else {
      setFormData({
        sku: "",
        name: "",
        price: "",
        stock: "",
      })
    }
    setErrors({})
  }, [product, isOpen])

  const validateForm = () => {
    try {
      const validatedData = ProductFormSchema.parse({
        sku: formData.sku,
        name: formData.name,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
      })
      setErrors({})
      return validatedData
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validatedData = validateForm()
    if (!validatedData) return

    setIsPending(true)
    try {
      if (isEditing && product) {
        await updateProduct(product.id, validatedData)
        console.log("Product updated successfully")
      } else {
        await createProduct(validatedData)
        console.log("Product created successfully")
      }
      onClose()
    } catch (error) {
      console.error("Failed to save product:", error)
      alert(`Failed to ${isEditing ? "update" : "create"} product`)
    } finally {
      setIsPending(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sm:max-w-md">
        <SheetHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <SheetTitle className="text-neutral-900 dark:text-neutral-50 text-xl font-semibold tracking-tight">
            {isEditing ? "Edit Product" : "Create New Product"}
          </SheetTitle>
          <SheetDescription className="text-neutral-500 dark:text-neutral-400">
            {isEditing ? "Update the product information below." : "Add a new product to your inventory."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label 
              htmlFor="sku" 
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              SKU <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="PROD-001"
              className={errors.sku ? "border-rose-500 focus-visible:ring-rose-500" : ""}
            />
            {errors.sku && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {errors.sku}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="name" 
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Product Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Product name"
              className={errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="price" 
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Price (€) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="0.00"
              className={errors.price ? "border-rose-500 focus-visible:ring-rose-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {errors.price}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="stock" 
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Stock Quantity <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange("stock", e.target.value)}
              placeholder="0"
              className={errors.stock ? "border-rose-500 focus-visible:ring-rose-500" : ""}
            />
            {errors.stock && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {errors.stock}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="flex-1"
            >
              {isPending ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
