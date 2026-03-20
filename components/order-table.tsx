"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import {
  fetchOrdersFromApi,
  Order,
  OrderStatus,
  updateOrderStatus
} from "@/lib/admin-orders-api"
import { PermissionGuard } from "@/components/permission-guard"
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
import { Eye, MoreHorizontal, Plus, Search, CheckCircle, RefreshCcw } from "lucide-react"
import { OrderDetailModal } from "./order-detail-modal"
import { CreateOrderModal } from "./create-order-modal"

const ITEMS_PER_PAGE = 10

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  SERVED: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  PAID: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
}

export function OrderTable() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tableFilter, setTableFilter] = useState<string>("")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)

  const loadOrders = useCallback(() => {
    setLoading(true)

    const apiStatus = statusFilter !== "all" ? statusFilter : undefined
    const apiTableId = tableFilter ? parseInt(tableFilter) : undefined

    fetchOrdersFromApi(currentPage - 1, ITEMS_PER_PAGE, "id", "desc", apiStatus, apiTableId)
      .then((data) => {
        setOrders(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
      })
      .catch((error) => {
        console.error("Failed to load orders", error)
      })
      .finally(() => setLoading(false))
  }, [currentPage, statusFilter, tableFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Simple local search by ID for immediate feedback
  const filtered = useMemo(() => {
    let result = orders
    if (search) {
      result = result.filter(o => o.id.toString().includes(search))
    }
    return result
  }, [orders, search])

  const handleUpdateStatus = useCallback(async (id: number, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...updated, items: o.items, paymentMethod: o.paymentMethod } : o))
      if (viewingOrder?.id === id) {
        setViewingOrder({ ...updated, items: viewingOrder.items, paymentMethod: viewingOrder.paymentMethod })
      }
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }, [viewingOrder])

  const canEdit = user ? hasPermission(user.role, "edit:orders") : true // default true for admin UI design

  return (
    <div className="space-y-4">
      {/* Header and Toolbar */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View, create, and manage cafe orders.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => {
              setCurrentPage(1)
              setStatusFilter(v)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SERVED">Served</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-[150px]">
              <Input
                placeholder="Table ID..."
                type="number"
                value={tableFilter}
                onChange={(e) => {
                  setCurrentPage(1)
                  setTableFilter(e.target.value)
                }}
              />
            </div>

            <Button variant="outline" size="icon" onClick={() => loadOrders()} title="Refresh">
              <RefreshCcw className="size-4" />
            </Button>
          </div>

          <PermissionGuard roles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF"]}>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create Order
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>User / Emp</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
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
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>T-{order.tableId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">U: {order.userId}</span>
                      <span className="text-xs text-muted-foreground">E: {order.employeeId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[order.status] || ""}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingOrder(order)
                            setDetailOpen(true)
                          }}
                        >
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        {canEdit && order.status !== "PAID" && order.status !== "CANCELLED" && (
                          <>
                            {order.status === "PENDING" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}>
                                <CheckCircle className="size-4 mr-2" />
                                Mark Confirmed
                              </DropdownMenuItem>
                            )}
                            {order.status === "CONFIRMED" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "SERVED")}>
                                <CheckCircle className="size-4 mr-2" />
                                Mark Served
                              </DropdownMenuItem>
                            )}
                            {order.status === "SERVED" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "PAID")}>
                                <CheckCircle className="size-4 mr-2" />
                                Mark Paid
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && totalPages > 1 && (
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

      <CreateOrderModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={loadOrders}
      />

      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdateStatus={(status) => handleUpdateStatus(viewingOrder.id, status)}
        />
      )}
    </div>
  )
}
