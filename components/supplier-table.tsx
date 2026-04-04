"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import { DeleteConfirm } from "@/components/delete-confirm"
import { SupplierModal } from "@/components/supplier-modal"
import { TablePagination } from "@/components/table-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  deleteSupplier,
  fetchSuppliers,
  saveSupplier,
  type Supplier,
  type SupplierDraft,
} from "@/lib/admin-suppliers-api"

const ITEMS_PER_PAGE = 6

function sortSuppliers(items: Supplier[]) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.createdAt).getTime()
    const rightDate = new Date(right.createdAt).getTime()

    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }

    return right.id - left.id
  })
}

export function SupplierTable() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const loadSuppliers = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchSuppliers()
      setSuppliers(sortSuppliers(data))
    } catch (error) {
      console.error("Failed to load suppliers", error)
      toast.error(error instanceof Error ? error.message : "Failed to load suppliers.")
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSuppliers()
  }, [loadSuppliers])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return suppliers
    }

    return suppliers.filter((supplier) =>
      [supplier.name, supplier.phone, supplier.email, supplier.address]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [search, suppliers])

  const totalItems = filteredSuppliers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredSuppliers])

  const handleSave = useCallback(async (draft: SupplierDraft) => {
    try {
      const savedSupplier = await saveSupplier(draft)

      setSuppliers((prev) => {
        const hasExisting = prev.some((item) => item.id === savedSupplier.id)
        const next = hasExisting
          ? prev.map((item) => (item.id === savedSupplier.id ? savedSupplier : item))
          : [savedSupplier, ...prev]

        return sortSuppliers(next)
      })

      setCurrentPage(1)
      setEditingSupplier(null)
      toast.success(draft.id ? "Supplier updated." : "Supplier created.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save supplier.")
      throw error
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deletingSupplier) {
      return
    }

    try {
      await deleteSupplier(deletingSupplier.id)
      setSuppliers((prev) => prev.filter((item) => item.id !== deletingSupplier.id))
      toast.success("Supplier deleted.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete supplier.")
    } finally {
      setDeletingSupplier(null)
      setDeleteOpen(false)
    }
  }, [deletingSupplier])

  const canCreate = user ? hasPermission(user.role, "create:suppliers") : false
  const canEdit = user ? hasPermission(user.role, "edit:suppliers") : false
  const canDelete = user ? hasPermission(user.role, "delete:suppliers") : false

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex">
            {totalItems} supplier{totalItems === 1 ? "" : "s"}
          </Badge>
        </div>

        <Button
          onClick={() => {
            setEditingSupplier(null)
            setModalOpen(true)
          }}
          disabled={!canCreate}
        >
          <Plus className="size-4" />
          Create Supplier
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{supplier.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingSupplier(supplier)
                              setModalOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                        ) : null}
                        {canDelete ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingSupplier(supplier)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && totalItems > 0 ? (
          <div className="border-t">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : null}
      </div>

      <SupplierModal
        supplier={editingSupplier}
        open={modalOpen}
        onOpenChange={(nextOpen) => {
          setModalOpen(nextOpen)
          if (!nextOpen) {
            setEditingSupplier(null)
          }
        }}
        onSave={(draft) => void handleSave(draft)}
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDelete()}
        itemName={deletingSupplier?.name ?? ""}
        title="Delete Supplier"
      />
    </div>
  )
}
