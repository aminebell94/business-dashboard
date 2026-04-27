"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { MinimalistSidebar } from "./minimalist-sidebar"
import { cn } from "@/lib/utils"

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex h-screen bg-background">
      <MinimalistSidebar />
      <main 
        className={cn(
          "flex-1 overflow-auto",
          isAuthenticated && "lg:ml-64"
        )}
      >
        <div className={cn(
          "p-4 lg:p-8",
          isAuthenticated && "pt-16 lg:pt-8"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}
