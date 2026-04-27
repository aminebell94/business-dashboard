"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { LoginFormSchema, type LoginFormData } from "@/lib/types"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLoading } from "./auth-loading"
import { cn } from "@/lib/utils"

interface LoginFormProps {
  className?: string
}

/**
 * LoginForm component
 * Handles user credential input and authentication submission
 * 
 * Features:
 * - React Hook Form with Zod schema validation
 * - Email and password input fields using shadcn/ui components
 * - Form submission calling login() from useAuth
 * - Loading state on submit button during authentication
 * - Inline validation error display
 * - Redirects to dashboard or original requested URL after successful login
 * 
 * Requirements: 1.1, 1.7, 1.8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.2, 11.5, 12.3
 */
export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  
  // Get redirect URL from query params (for post-login navigation)
  const redirectUrl = searchParams.get("redirect") || "/"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * Sanitize input to prevent XSS attacks
   * Removes potentially dangerous characters while preserving valid input
   */
  const sanitizeInput = (input: string): string => {
    if (!input) return input
    
    // Remove HTML tags and script content
    let sanitized = input.replace(/<[^>]*>/g, '')
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '')
    
    // Trim whitespace
    sanitized = sanitized.trim()
    
    return sanitized
  }

  /**
   * Handle form submission
   * Calls login() from AuthProvider and redirects on success
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      // Sanitize inputs before sending to API
      const sanitizedEmail = sanitizeInput(data.email)
      const sanitizedPassword = sanitizeInput(data.password)
      
      // Call login method from AuthProvider
      await login(sanitizedEmail, sanitizedPassword)
      
      // Login successful - redirect to dashboard or original requested URL
      router.push(redirectUrl)
    } catch (error) {
      // Error handling is done in AuthProvider (toast notifications)
      // Form will remain on page for user to retry
      
      // Log error for debugging (without sensitive data)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error("Login form submission error:", {
        message: errorMessage,
        // Note: Email is logged for debugging, but password is never logged
      })
    }
  }

  // Determine if form should be disabled (during submission or auth loading)
  const isFormDisabled = isSubmitting || authLoading

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={cn("space-y-6", className)}
    >
      {/* Email Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          autoComplete="email"
          disabled={isFormDisabled}
          className={cn(
            errors.email && "border-rose-500 dark:border-rose-500 focus-visible:ring-rose-500"
          )}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-rose-500 dark:text-rose-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="password" 
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isFormDisabled}
            className={cn(
              "pr-10",
              errors.password && "border-rose-500 dark:border-rose-500 focus-visible:ring-rose-500"
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isFormDisabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-rose-500 dark:text-rose-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isFormDisabled}
      >
        {isFormDisabled ? (
          <span className="flex items-center gap-2">
            <AuthLoading size="sm" />
            <span>Signing in...</span>
          </span>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
