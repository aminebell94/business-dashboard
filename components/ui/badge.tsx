import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 ease-in-out overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 [a&]:hover:bg-neutral-200 dark:[a&]:hover:bg-neutral-800',
        secondary:
          'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 [a&]:hover:bg-neutral-100 dark:[a&]:hover:bg-neutral-900',
        destructive:
          'border-rose-200 dark:border-rose-900 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 [a&]:hover:bg-rose-200 dark:[a&]:hover:bg-rose-900 focus-visible:ring-rose-500/20',
        success:
          'border-emerald-200 dark:border-emerald-900 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 [a&]:hover:bg-emerald-200 dark:[a&]:hover:bg-emerald-900',
        warning:
          'border-amber-200 dark:border-amber-900 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 [a&]:hover:bg-amber-200 dark:[a&]:hover:bg-amber-900',
        info:
          'border-blue-200 dark:border-blue-900 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 [a&]:hover:bg-blue-200 dark:[a&]:hover:bg-blue-900',
        outline:
          'border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 [a&]:hover:bg-neutral-100 dark:[a&]:hover:bg-neutral-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
