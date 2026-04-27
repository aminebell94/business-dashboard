import { z } from "zod"

// Order Status Types
export const OrderStatus = {
  EN_PREPARATION: "En préparation",
  PRODUIT_NON_DISPONIBLE: "Produit non disponible",
  SORTIE_EN_LIVRAISON: "Sortie en livraison",
  PROBLEME_DANS_COMMANDE: "Problème dans la commande",
  LIVREE: "Livrée",
  REPORTEE: "Reportée",
  ANNULEE: "Annulée",
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]

// Zod Schemas
export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be non-negative"),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  product: ProductSchema,
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
})

export const OrderSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  orderNumber: z.string(),
  customerId: z.string(),
  customer: CustomerSchema,
  items: z.array(OrderItemSchema),
  status: z.enum([
    OrderStatus.EN_PREPARATION,
    OrderStatus.PRODUIT_NON_DISPONIBLE,
    OrderStatus.SORTIE_EN_LIVRAISON,
    OrderStatus.PROBLEME_DANS_COMMANDE,
    OrderStatus.LIVREE,
    OrderStatus.REPORTEE,
    OrderStatus.ANNULEE,
  ]),
  total: z.number().min(0, "Total must be positive"),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "employee"]),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Authentication Schemas
export const UserRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
})

export const AuthUserSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  provider: z.string(),
  confirmed: z.boolean(),
  blocked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: UserRoleSchema.optional(),
})

export const AuthResponseSchema = z.object({
  jwt: z.string(),
  user: AuthUserSchema,
})

export const LoginCredentialsSchema = z.object({
  identifier: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const LoginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const StrapiErrorSchema = z.object({
  error: z.object({
    status: z.number(),
    name: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
})

// Type exports
export type Product = z.infer<typeof ProductSchema>
export type Customer = z.infer<typeof CustomerSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type Order = z.infer<typeof OrderSchema>
export type User = z.infer<typeof UserSchema>

// Authentication type exports
export type UserRole = z.infer<typeof UserRoleSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type LoginFormData = z.infer<typeof LoginFormSchema>
export type StrapiError = z.infer<typeof StrapiErrorSchema>

// API Response types
export interface KPIData {
  ordersToday: number
  orders7d: number
  orders30d: number
  revenueToday: number
  revenue7d: number
  revenue30d: number
}

export interface RevenueChartData {
  date: string
  revenue: number
}

export interface OrderStatusChartData {
  status: OrderStatusType
  count: number
  percentage: number
}
