"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import {
  AdminUser,
  deleteUserById,
  fetchUsersFromApi,
  toggleUserActive,
} from "@/lib/admin-users-api"
import { TablePagination } from "@/components/table-pagination"
import { DeleteConfirm } from "@/components/delete-confirm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Trash2 } from "lucide-react"

const ITEMS_PER_PAGE = 6

export function UserTable() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const canManageUsers = user ? hasPermission(user.role, "manage:users") : false

  useEffect(() => {
    setLoading(true)

    fetchUsersFromApi(currentPage - 1, ITEMS_PER_PAGE, search || undefined)
      .then((data) => {
        setUsers(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
      })
      .catch((error) => {
        console.error("Failed to load users", error)
        setUsers([])
        setTotalPages(0)
        setTotalItems(0)
      })
      .finally(() => setLoading(false))
  }, [currentPage, search])

  async function handleToggleActive(id: string) {
    if (!canManageUsers) return
    try {
      await toggleUserActive(id)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, active: !u.active } : u,
        ),
      )
    } catch (error) {
      console.error("Failed to toggle user active", error)
    }
  }

  async function handleDelete() {
    if (!deletingUser || !canManageUsers) return
    try {
      await deleteUserById(deletingUser.id)
      setDeleteOpen(false)
      setDeletingUser(null)
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to delete user", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Eye className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {canManageUsers ? (
                      <Switch
                        checked={u.active}
                        onCheckedChange={() => void handleToggleActive(u.id)}
                      />
                    ) : (
                      <span className="text-sm">
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageUsers && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingUser(u)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && (
          <div className="border-t">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDelete()}
        productName={deletingUser?.name ?? ""}
        title="Delete User"
      />
    </div>
  )
}

