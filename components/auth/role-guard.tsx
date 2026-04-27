"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

/**
 * Props for the RoleGuard component
 */
export interface RoleGuardProps {
  /** Content to render if user has required roles */
  children: React.ReactNode
  
  /** List of allowed role names (e.g., ['admin', 'manager']) */
  allowedRoles: string[]
  
  /** 
   * If true, user must have ALL roles in allowedRoles
   * If false, user needs ANY role from allowedRoles
   * @default false
   */
  requireAll?: boolean
  
  /** Optional custom content to show when access is denied */
  fallback?: React.ReactNode
}

/**
 * RoleGuard component restricts access to UI elements based on user roles
 * 
 * @example
 * ```tsx
 * // User needs admin OR manager role
 * <RoleGuard allowedRoles={['admin', 'manager']}>
 *   <DeleteButton />
 * </RoleGuard>
 * 
 * // User needs BOTH admin AND manager roles
 * <RoleGuard allowedRoles={['admin', 'manager']} requireAll>
 *   <SuperAdminPanel />
 * </RoleGuard>
 * 
 * // Custom fallback message
 * <RoleGuard allowedRoles={['admin']} fallback={<p>Admin only</p>}>
 *   <AdminSettings />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  children,
  allowedRoles,
  requireAll = false,
  fallback,
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    console.log('[RoleGuard] User not authenticated')
    return null
  }

  // Extract user's role name (Strapi returns a single role object)
  const userRoleName = user.role?.name
  
  // Debug logging
  console.log('[RoleGuard] User role:', userRoleName)
  console.log('[RoleGuard] Allowed roles:', allowedRoles)
  console.log('[RoleGuard] User object:', user)

  // If user has no role, deny access
  if (!userRoleName) {
    console.log('[RoleGuard] User has no role, denying access')
    return fallback || <AccessDeniedMessage />
  }

  // Check if user has required roles
  const hasAccess = requireAll
    ? allowedRoles.every((role) => userRoleName === role)
    : allowedRoles.some((role) => userRoleName === role)

  console.log('[RoleGuard] Has access:', hasAccess)

  // Render children if user has access, otherwise show fallback
  if (hasAccess) {
    return <>{children}</>
  }

  return fallback || <AccessDeniedMessage />
}

/**
 * Default access denied message component
 */
function AccessDeniedMessage() {
  return (
    <Alert variant="destructive" className="my-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        You don't have permission to access this feature.
      </AlertDescription>
    </Alert>
  )
}
