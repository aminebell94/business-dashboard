'use client'

import React from 'react'
import { MinimalistCard } from '@/components/ui/minimalist-card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <MinimalistCard variant="bordered" padding="lg" className="max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Error Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>

              {/* Error Title */}
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                Something went wrong
              </h2>

              {/* Error Message */}
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>

              {/* Error Details (in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mt-4 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md">
                  <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Retry Button */}
              <Button
                onClick={this.handleReset}
                variant="default"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </MinimalistCard>
        </div>
      )
    }

    return this.props.children
  }
}
