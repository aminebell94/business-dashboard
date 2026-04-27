"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthLoadingProps {
  /**
   * Optional custom className for the container
   */
  className?: string
  /**
   * Size variant for the spinner
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
  /**
   * Optional loading message to display below the spinner
   */
  message?: string
}

/**
 * AuthLoading component
 * 
 * Reusable loading spinner component for authentication operations.
 * Used throughout the authentication flow for consistent loading states.
 * 
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
 * 
 * @example
 * ```tsx
 * // Default usage
 * <AuthLoading />
 * 
 * // With custom message
 * <AuthLoading message="Signing in..." />
 * 
 * // Small size for inline use
 * <AuthLoading size="sm" />
 * ```
 */
export function AuthLoading({ className, size = "default", message }: AuthLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size]
        )} 
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
