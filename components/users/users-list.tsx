"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MinimalistCard } from "@/components/ui/minimalist-card"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getUsers } from "@/lib/api"
import { Users, Shield, UserCheck, UserX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/ui/query-error"
import type { User } from "@/lib/types"
import { toast } from "sonner"

export function UsersList() {
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    retry: 2,
  })

  // Mock mutation for updating user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "employee" }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { userId, role }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["users"], (oldUsers: User[] | undefined) => {
        if (!oldUsers) return oldUsers
        return oldUsers.map((user) => (user.id === data.userId ? { ...user, role: data.role } : user))
      })
      toast.success("User role updated successfully")
    },
    onError: () => {
      toast.error("Failed to update user role")
    },
  })

  // Mock mutation for toggling user active status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { userId, isActive }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["users"], (oldUsers: User[] | undefined) => {
        if (!oldUsers) return oldUsers
        return oldUsers.map((user) => (user.id === data.userId ? { ...user, isActive: data.isActive } : user))
      })
      toast.success(`User ${data.isActive ? "activated" : "deactivated"} successfully`)
    },
    onError: () => {
      toast.error("Failed to update user status")
    },
  })

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRoleChange = (userId: string, role: "admin" | "employee") => {
    updateUserRoleMutation.mutate({ userId, role })
  }

  const handleStatusToggle = (userId: string, isActive: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <MinimalistCard key={i} variant="elevated" padding="md">
              <Skeleton className="h-16 w-full" />
            </MinimalistCard>
          ))}
        </div>

        {/* Table skeleton */}
        <MinimalistCard variant="elevated" padding="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </MinimalistCard>
      </div>
    )
  }

  if (error) {
    return <QueryError error={error as Error} onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MinimalistCard variant="elevated" padding="md" className="transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Users</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{users?.length || 0}</p>
            </div>
          </div>
        </MinimalistCard>

        <MinimalistCard variant="elevated" padding="md" className="transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Users</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                {users?.filter((user) => user.isActive).length || 0}
              </p>
            </div>
          </div>
        </MinimalistCard>

        <MinimalistCard variant="elevated" padding="md" className="transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Administrators</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                {users?.filter((user) => user.role === "admin").length || 0}
              </p>
            </div>
          </div>
        </MinimalistCard>
      </div>

      {/* Users Table */}
      <MinimalistCard variant="elevated" padding="none" className="overflow-hidden">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">All Users</h2>
          <SearchInput
            placeholder="Search users..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-500 dark:text-neutral-400 py-12">
                    <Users className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                    <p>No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id} className="transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: "admin" | "employee") => handleRoleChange(user.id, value)}
                        disabled={updateUserRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="employee">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Employee
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500 dark:text-neutral-400">
                      {user.createdAt.toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {user.isActive ? "Deactivate" : "Activate"}
                        </span>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) => handleStatusToggle(user.id, checked)}
                          disabled={toggleUserStatusMutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </MinimalistCard>
    </div>
  )
}
