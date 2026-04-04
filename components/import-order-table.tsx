"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { ImportOrderDetailModal } from "@/components/import-order-detail-modal"
import { ImportOrderFormModal } from "@/components/import-order-form-modal"
import { TablePagination } from "@/components/table-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  fetchImportOrders,
  type ImportOrder,
} from "@/lib/admin-import-orders-api"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import { fetchSuppliers, type Supplier } from "@/lib/admin-suppliers-api"

const ITEMS_PER_PAGE = 6

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function sortImportOrders(items: ImportOrder[]) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.createdAt).getTime()
    const rightDate = new Date(right.createdAt).getTime()

    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }

    return right.id - left.id
  })
}

export function ImportOrderTable() {
  const { user } = useAuth()
  const [importOrders, setImportOrders] = useState<ImportOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const [ordersData, suppliersData] = await Promise.all([fetchImportOrders(), fetchSuppliers()])
      setImportOrders(sortImportOrders(ordersData))
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Failed to load import orders", error)
      toast.error(error instanceof Error ? error.message : "Failed to load import orders.")
      setImportOrders([])
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return importOrders
    }

    return importOrders.filter((order) =>
      [order.id.toString(), order.supplierName, order.status].join(" ").toLowerCase().includes(query),
    )
  }, [importOrders, search])

  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredOrders])

  const canCreate = user ? hasPermission(user.role, "create:import-orders") : false

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search import orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex">
            {totalItems} order{totalItems === 1 ? "" : "s"}
          </Badge>
        </div>

        <Button onClick={() => setCreateOpen(true)} disabled={!canCreate}>
          <Plus className="size-4" />
          Create Import Order
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
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
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No import orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => {
                    setSelectedOrder(order)
                    setDetailOpen(true)
                  }}
                >
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.supplierName}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(order.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === "PAID" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
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

      <ImportOrderFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        suppliers={suppliers}
        onCreated={(createdOrder) => {
          setImportOrders((prev) => sortImportOrders([createdOrder, ...prev]))
          setSelectedOrder(createdOrder)
          setDetailOpen(true)
          setCurrentPage(1)
        }}
      />

      <ImportOrderDetailModal
        importOrder={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
