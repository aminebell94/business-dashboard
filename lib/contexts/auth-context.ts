"use client"

import { createContext, useContext } from "react"
import type { AuthUser } from "@/lib/types"

/**
 * Authentication context value interface
 * Provides authentication state and methods to consuming components
 */
export interface AuthContextValue {
  /** Current authenticated user or null if not authenticated */
  user: AuthUser | null
  
  /** Loading state during authentication operations */
  isLoading: boolean
  
  /** Derived boolean indicating if user is authenticated */
  isAuthenticated: boolean
  
  /** 
   * Authenticate user with email and password
   * @throws Error if authentication fails
   */
  login: (email: string, password: string) => Promise<void>
  
  /** Clear session and redirect to login */
  logout: () => void
  
  /** Verify and refresh current session */
  refreshSession: () => Promise<void>
}

/**
 * Authentication context
 * Provides authentication state and methods throughout the application
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth()
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}
