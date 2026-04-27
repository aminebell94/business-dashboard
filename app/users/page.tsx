"use client"

import { UsersList } from "@/components/users/users-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Users
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Manage user accounts, roles, and permissions for your team members.
          </p>
        </div>

        <UsersList />
      </div>
    </ProtectedRoute>
  )
}
