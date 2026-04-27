"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { AuthLoading } from "./auth-loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ProtectedRoute component
 * 
 * Wraps pages that require authentication. Redirects unauthenticated users to login
 * with the current path preserved for post-login redirection.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 11.3**
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <OrdersPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      // Preserve the current path for post-login redirection
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Show loading fallback while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <AuthLoading message="Checking authentication..." />
        </div>
      )
    )
  }

  // Don't render children if not authenticated (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return null
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
