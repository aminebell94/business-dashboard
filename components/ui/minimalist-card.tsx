import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  // Base styles - applied to all variants
  'rounded-lg transition-all duration-[250ms] ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm',
        elevated: 'bg-white dark:bg-neutral-900 border-0 shadow-md hover:shadow-lg',
        flat: 'bg-neutral-50 dark:bg-neutral-950 border-0 shadow-none',
        bordered: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-700 shadow-none'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      },
      hover: {
        true: 'hover:scale-[1.01] cursor-pointer',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false
    }
  }
)

export interface MinimalistCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode
}

export const MinimalistCard = React.forwardRef<HTMLDivElement, MinimalistCardProps>(
  ({ children, variant, padding, hover, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MinimalistCard.displayName = 'MinimalistCard'
