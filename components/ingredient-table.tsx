"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import {
  deleteIngredientById,
  fetchIngredientsFromApi,
  saveIngredient,
  type Ingredient,
  type IngredientDraft,
} from "@/lib/admin-ingredients-api"
import { PermissionGuard } from "@/components/permission-guard"
import { IngredientModal } from "@/components/ingredient-modal"
import { DeleteConfirm } from "@/components/delete-confirm"
import { TablePagination } from "@/components/table-pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"

const ITEMS_PER_PAGE = 6

function sortIngredients(items: Ingredient[]) {
  return [...items].sort((left, right) => {
    const byDate =
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()

    if (byDate !== 0) {
      return byDate
    }

    return right.id - left.id
  })
}

function renderStockCell(ingredient: Ingredient) {
  if (ingredient.stock === 0) {
    return (
      <div className="space-y-1">
        <p className="font-semibold text-red-600">Out of stock</p>
        <p className="text-xs text-muted-foreground">
          {ingredient.stock}
          {ingredient.unit}
        </p>
      </div>
    )
  }

  if (ingredient.stock < 10) {
    return (
      <div className="space-y-1">
        <p className="font-semibold text-amber-600">
          {ingredient.stock}
          {ingredient.unit}
        </p>
        <p className="text-xs text-amber-600">Low stock warning</p>
      </div>
    )
  }

  return (
    <span className="font-medium text-foreground">
      {ingredient.stock}
      {ingredient.unit}
    </span>
  )
}

export function IngredientTable() {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const loadIngredients = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchIngredientsFromApi()
      setIngredients(sortIngredients(data))
    } catch (error) {
      console.error("Failed to load ingredients", error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIngredients()
  }, [loadIngredients])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return ingredients
    }

    return ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(query))
  }, [ingredients, search])

  const totalItems = filteredIngredients.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredIngredients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredIngredients])

  const handleSave = useCallback(async (ingredient: IngredientDraft) => {
    const savedIngredient = await saveIngredient(ingredient)

    setIngredients((prev) => {
      const hasExisting = prev.some((item) => item.id === savedIngredient.id)
      const next = hasExisting
        ? prev.map((item) => (item.id === savedIngredient.id ? savedIngredient : item))
        : [savedIngredient, ...prev]

      return sortIngredients(next)
    })

    setCurrentPage(1)
    setEditingIngredient(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deletingIngredient) {
      return
    }

    await deleteIngredientById(deletingIngredient.id)
    setIngredients((prev) => prev.filter((item) => item.id !== deletingIngredient.id))
    setDeleteOpen(false)
    setDeletingIngredient(null)
  }, [deletingIngredient])

  const canCreate = user ? hasPermission(user.role, "create:ingredients") : false
  const canEdit = user ? hasPermission(user.role, "edit:ingredients") : false
  const canDelete = user ? hasPermission(user.role, "delete:ingredients") : false

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex">
            {totalItems} ingredient{totalItems === 1 ? "" : "s"}
          </Badge>
        </div>

        <PermissionGuard roles={["ROLE_ADMIN"]}>
          <Button
            onClick={() => {
              setEditingIngredient(null)
              setModalOpen(true)
            }}
            disabled={!canCreate}
          >
            <Plus className="size-4" />
            Create Ingredient
          </Button>
        </PermissionGuard>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedIngredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No ingredients found
                </TableCell>
              </TableRow>
            ) : (
              paginatedIngredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.id}</TableCell>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{renderStockCell(ingredient)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="uppercase">
                      {ingredient.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ingredient.createdAt).toLocaleDateString()}</TableCell>
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
                              setEditingIngredient(ingredient)
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
                              setDeletingIngredient(ingredient)
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

      <IngredientModal
        ingredient={editingIngredient}
        open={modalOpen}
        onOpenChange={(nextOpen) => {
          setModalOpen(nextOpen)
          if (!nextOpen) {
            setEditingIngredient(null)
          }
        }}
        onSave={(ingredient) => void handleSave(ingredient)}
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDelete()}
        itemName={deletingIngredient?.name ?? ""}
        title="Delete Ingredient"
      />
    </div>
  )
}
