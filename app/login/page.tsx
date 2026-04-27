"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLoading } from "@/components/auth/auth-loading"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Login Page Content Component
 * Wrapped in Suspense boundary to handle useSearchParams
 */
function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  
  // Get redirect URL from query params (default to dashboard)
  const redirectUrl = searchParams.get("redirect") || "/"

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, redirectUrl])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AuthLoading message="Loading..." />
      </div>
    )
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign In
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Login Page
 * Public route for user authentication
 * 
 * Features:
 * - Renders LoginForm component in a centered card layout
 * - Handles redirect query parameter for post-login navigation
 * - Redirects to dashboard if user is already authenticated
 * - Responsive centered layout using shadcn/ui Card components
 * 
 * Requirements: 1.5, 4.3, 4.4
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AuthLoading message="Loading..." />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
