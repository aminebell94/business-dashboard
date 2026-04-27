"use client"

import type React from "react"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      position="bottom-right"
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-neutral-900 group-[.toaster]:text-neutral-900 dark:group-[.toaster]:text-neutral-50 group-[.toaster]:border group-[.toaster]:border-neutral-200 dark:group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-md group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-neutral-600 dark:group-[.toast]:text-neutral-400",
          actionButton: "group-[.toast]:bg-neutral-900 dark:group-[.toast]:bg-neutral-50 group-[.toast]:text-white dark:group-[.toast]:text-neutral-900 group-[.toast]:rounded-md group-[.toast]:transition-all group-[.toast]:duration-200",
          cancelButton: "group-[.toast]:bg-neutral-100 dark:group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-700 dark:group-[.toast]:text-neutral-300 group-[.toast]:rounded-md group-[.toast]:transition-all group-[.toast]:duration-200",
          success: "group-[.toaster]:border-emerald-200 dark:group-[.toaster]:border-emerald-900 group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-950 group-[.toaster]:text-emerald-900 dark:group-[.toaster]:text-emerald-50",
          error: "group-[.toaster]:border-rose-200 dark:group-[.toaster]:border-rose-900 group-[.toaster]:bg-rose-50 dark:group-[.toaster]:bg-rose-950 group-[.toaster]:text-rose-900 dark:group-[.toaster]:text-rose-50",
          warning: "group-[.toaster]:border-amber-200 dark:group-[.toaster]:border-amber-900 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950 group-[.toaster]:text-amber-900 dark:group-[.toaster]:text-amber-50",
          info: "group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-900 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950 group-[.toaster]:text-blue-900 dark:group-[.toaster]:text-blue-50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
