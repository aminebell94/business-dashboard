"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AuthContext, type AuthContextValue } from "@/lib/contexts/auth-context"
import type { AuthUser } from "@/lib/types"
import { 
  loginUser,
  getCurrentUser, 
  getAuthToken, 
  clearAuthToken 
} from "@/lib/api"

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider component
 * Wraps the application to provide authentication context and manage session state
 * 
 * Features:
 * - Initializes session on mount by checking localStorage for existing token
 * - Verifies token with backend using getCurrentUser()
 * - Manages authentication state (user, isLoading)
 * - Provides login, logout, and refreshSession methods to consuming components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()

  /**
   * Initialize session on mount
   * Checks for existing token in localStorage and verifies it with the backend
   */
  useEffect(() => {
    async function initializeSession() {
      try {
        const token = getAuthToken()
        
        if (!token) {
          // No token found, user is not authenticated
          setIsLoading(false)
          return
        }

        // Token exists, verify it with the backend
        try {
          const userData = await getCurrentUser()
          setUser(userData)
        } catch (error) {
          // Token verification failed, clear invalid token
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          // Log error for debugging (without sensitive data)
          console.error('Session initialization failed:', {
            message: errorMessage,
            hasToken: !!token,
          })
          
          // Clear invalid token
          clearAuthToken()
          setUser(null)
          
          // Don't show toast on initial load if session is just expired
          // User will see login page naturally
        }
      } catch (error) {
        // Unexpected error during initialization
        console.error('Unexpected error during session initialization:', error)
        clearAuthToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  /**
   * Login method
   * Authenticates user with email and password, stores JWT token, and updates context state
   * 
   * @param email - User's email address
   * @param password - User's password
   * @throws Error if authentication fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Call loginUser API function which handles token storage internally
      const { user: userData } = await loginUser(email, password)
      
      // Update context state with user data
      setUser(userData)
      
      // Success - no need to show toast, the UI will redirect
    } catch (error) {
      // Handle different error types and display appropriate toast notifications
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      // Log error for debugging (without sensitive data)
      console.error('Login error:', {
        message: errorMessage,
        // Note: User inputs (email, password) are never logged for security
      })
      
      // Map common error messages to user-friendly notifications
      if (errorMessage.includes('Invalid identifier or password')) {
        toast.error('Login Failed', {
          description: 'Invalid email or password',
        })
      } else if (errorMessage.includes('Unable to connect') || errorMessage.includes('Network error')) {
        toast.error('Connection Error', {
          description: 'Unable to connect. Please try again',
        })
      } else if (errorMessage.includes('malformed') || errorMessage.includes('Invalid response')) {
        toast.error('Server Error', {
          description: 'Received invalid response from server. Please try again.',
        })
      } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
        toast.error('Server Error', {
          description: 'Server error. Please try again later',
        })
      } else {
        // Generic error message for unexpected errors
        toast.error('Login Failed', {
          description: errorMessage || 'An unexpected error occurred',
        })
      }
      
      // Re-throw the error so the form can handle it if needed
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout method
   * Clears authentication token, user state, invalidates TanStack Query cache, and redirects to login
   * 
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 12.4
   */
  const logout = (): void => {
    try {
      // Clear token from localStorage
      clearAuthToken()
      
      // Clear user state in context
      setUser(null)
      
      // Invalidate all TanStack Query cache to clear any cached user data
      queryClient.clear()
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      // Log error but still attempt to clear state and redirect
      console.error('Logout error:', error)
      
      // Ensure cleanup happens even if there's an error
      clearAuthToken()
      setUser(null)
      queryClient.clear()
      router.push('/login')
    }
  }

  /**
   * Refresh session method
   * Verifies the current token is still valid and updates the user state accordingly
   * 
   * This method is useful for:
   * - Checking token validity before critical operations
   * - Recovering from 401 responses by attempting to refresh
   * - Manual session refresh when needed
   * 
   * Requirements: 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4
   */
  const refreshSession = async (): Promise<void> => {
    try {
      // Check if we have a token to refresh
      const token = getAuthToken()
      
      if (!token) {
        // No token to refresh, clear session
        console.warn('No token found during refresh session')
        setUser(null)
        return
      }

      // Call getCurrentUser() to verify token is still valid
      try {
        const userData = await getCurrentUser()
        
        // Token is valid, update user state
        setUser(userData)
      } catch (error) {
        // Token verification failed (expired, invalid, or 401 response)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Log error for debugging (without sensitive data)
        console.error("Session refresh failed:", {
          message: errorMessage,
          hasToken: !!token,
        })
        
        // Clear session and redirect to login
        clearAuthToken()
        setUser(null)
        
        // Invalidate TanStack Query cache to clear any cached user data
        queryClient.clear()
        
        // Only show toast if it's not a session expiration (user should see login page naturally)
        if (!errorMessage.includes('Session expired') && !errorMessage.includes('401')) {
          toast.error('Session Error', {
            description: 'Your session could not be refreshed. Please log in again.',
          })
        }
        
        // Redirect to login page
        router.push('/login')
      }
    } catch (error) {
      // Unexpected error during refresh
      console.error('Unexpected error during session refresh:', error)
      
      // Clear session as a safety measure
      clearAuthToken()
      setUser(null)
      queryClient.clear()
      router.push('/login')
    }
  }

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
