'use client'

import { MinimalistCard } from '@/components/ui/minimalist-card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface QueryErrorProps {
  error?: Error | null
  onRetry?: () => void
  message?: string
}

export function QueryError({ error, onRetry, message }: QueryErrorProps) {
  const errorMessage = message || error?.message || 'An error occurred while loading data'

  return (
    <MinimalistCard variant="bordered" padding="lg">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950">
          <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {errorMessage}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Please try again or contact support if the problem persists.
          </p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </div>
    </MinimalistCard>
  )
}
