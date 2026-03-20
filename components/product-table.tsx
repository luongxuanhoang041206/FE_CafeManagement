"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import type { Product } from "@/lib/mock-data"
import {
  deleteProductById,
  fetchProductsFromApi,
  saveProduct,
  toggleProductStatus,
} from "@/lib/admin-products-api"
import { PermissionGuard } from "@/components/permission-guard"
import { ProductModal } from "@/components/product-modal"
import { ProductDrawer } from "@/components/product-drawer"
import { DeleteConfirm } from "@/components/delete-confirm"
import { TablePagination } from "@/components/table-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"

const ITEMS_PER_PAGE = 6

export function ProductTable() {
  const { user } = useAuth()
  const [sortOption, setSortOption] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modal/drawer state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // ✅ FETCH BACKEND PAGINATION
  useEffect(() => {
    setLoading(true)

    let sortBy: string | undefined
    let direction: string | undefined

    if (sortOption === "created_desc") {
      sortBy = "createdAt"
      direction = "desc"
    } else if (sortOption === "created_asc") {
      sortBy = "createdAt"
      direction = "asc"
    } else if (sortOption === "price_asc") {
      sortBy = "price"
      direction = "asc"
    } else if (sortOption === "price_desc") {
      sortBy = "price"
      direction = "desc"
    }

    fetchProductsFromApi(currentPage - 1, ITEMS_PER_PAGE, sortBy, direction)
      .then((data) => {
        setProducts(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
      })
      .catch((error) => {
        console.error("Failed to load products", error)
      })
      .finally(() => setLoading(false))

  }, [currentPage, sortOption])

  // ✅ search + filter local trên page hiện tại (trên trang hiện tại)
  const filtered = useMemo(() => {
    let result = products

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toString().toLowerCase().includes(q) ||
          p.groupId.toLowerCase().includes(q),
      )
    }

    if (filter === "active") result = result.filter((p) => p.active)
    if (filter === "inactive") result = result.filter((p) => !p.active)

    return result
  }, [products, search, filter])

  const handleToggle = useCallback(async (id: number) => {
    try {
      const updated = await toggleProductStatus(id)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (error) {
      console.error("Failed to toggle product status", error)
    }
  }, [])

  // const handleSave = useCallback(async (product: Product) => {
  //   try {
  //     await saveProduct(product)
  //     // reload page sau khi save
  //     setCurrentPage(1)
  //   } catch (error) {
  //     console.error("Failed to save product", error)
  //   }
  // }, [])

  // const handleDelete = useCallback(async () => {
  //   if (!deletingProduct) return
  //   try {
  //     await deleteProductById(deletingProduct.id)
  //     setDeleteOpen(false)
  //     setDeletingProduct(null)
  //     setCurrentPage(1)
  //   } catch (error) {
  //     console.error("Failed to delete product", error)
  //   }
  // }, [deletingProduct])

  const handleSave = useCallback(async (product: Product) => {
    try {
      await saveProduct(product)
      // reload page after save
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to save product", error)
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deletingProduct) return
    try {
      await deleteProductById(deletingProduct.id)
      setDeleteOpen(false)
      setDeletingProduct(null)
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to delete product", error)
    }
  }, [deletingProduct])

  const canToggle = user ? hasPermission(user.role, "toggle:products") : false
  const canEdit = user ? hasPermission(user.role, "edit:products") : false
  const canDelete = user ? hasPermission(user.role, "delete:products") : false

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOption} onValueChange={(v) => {
            setCurrentPage(1)
            setSortOption(v)
          }}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Newest</SelectItem>
              <SelectItem value="created_asc">Oldest</SelectItem>
              <SelectItem value="price_asc">Price ascending</SelectItem>
              <SelectItem value="price_desc">Price descending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PermissionGuard roles={["ROLE_ADMIN"]}>
          <Button onClick={() => { setEditingProduct(null); setModalOpen(true) }}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </PermissionGuard>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {product.active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.groupId}</TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {/* Detail */}
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingProduct(product)
                            setDrawerOpen(true)
                          }}
                        >
                          <Eye className="size-4 mr-2" />
                          Detail
                        </DropdownMenuItem>

                        {/* Edit */}
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProduct(product)
                              setModalOpen(true)
                            }}
                          >
                            <Pencil className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingProduct(product)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="size-4 mr-2" />
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

      <ProductModal
        product={editingProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={(p) => void handleSave(p)}
      />

      <ProductDrawer
        product={viewingProduct}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDelete()}
        productName={deletingProduct?.name ?? ""}
      />
    </div>
  )
}