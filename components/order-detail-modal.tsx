"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Order, OrderStatus, getOrderById } from "@/lib/admin-orders-api"
import { STATUS_COLORS } from "./order-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

interface OrderDetailModalProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (status: OrderStatus) => void
}

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const [fullOrder, setFullOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !order.id) {
      return
    }

    setLoading(true)
    getOrderById(order.id)
      .then((data) => setFullOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open, order.id])

  useEffect(() => {
    if (fullOrder && order.status !== fullOrder.status) {
      setFullOrder((prev) => (prev ? { ...prev, status: order.status } : null))
    }
  }, [order.status, fullOrder])

  function onAction(status: OrderStatus) {
    onUpdateStatus(status)
  }

  const activeOrder = fullOrder || order
  const displayTable = activeOrder.tableLabel || (activeOrder.tableId ? `Table ${activeOrder.tableId}` : "N/A")
  const paymentLabel =
    activeOrder.payment?.method ||
    activeOrder.methodPayment ||
    (activeOrder.status === "PAID" ? "PAID" : "UNPAID")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex flex-col gap-3 pr-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle className="text-xl">Order #{activeOrder.id}</DialogTitle>
              <DialogDescription className="mt-1">
                {new Date(activeOrder.created_at).toLocaleString()} - {displayTable}
              </DialogDescription>
            </div>
            <Badge variant="outline" className={STATUS_COLORS[activeOrder.status]}>
              {activeOrder.status}
            </Badge>
          </div>
        </DialogHeader>

        {loading && !fullOrder ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="mt-1 font-semibold">
                    {activeOrder.customer?.name || `User #${activeOrder.userId}`}
                  </p>
                  {activeOrder.customer?.email ? (
                    <p className="text-sm text-muted-foreground">{activeOrder.customer.email}</p>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Handled By</p>
                  <p className="mt-1 font-semibold">
                    {activeOrder.employee?.name || `Employee #${activeOrder.employeeId}`}
                  </p>
                  {activeOrder.employee?.position ? (
                    <p className="text-sm text-muted-foreground">{activeOrder.employee.position}</p>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source / Payment</p>
                  <p className="mt-1 font-semibold">{activeOrder.orderSource}</p>
                  <p className="text-sm text-muted-foreground">{paymentLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="mt-1 text-lg font-semibold text-primary">
                    {formatCurrency(activeOrder.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {activeOrder.address ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="mt-1 font-medium">{activeOrder.address}</p>
                </div>
              ) : null}

              <Separator />

              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrder.items && activeOrder.items.length > 0 ? (
                      activeOrder.items.map((item) => (
                        <TableRow key={item.id ?? `${item.productId}-${item.name}`}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.lineTotal ?? item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No items found for this order.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Table</p>
                  <p className="mt-1 font-semibold">{displayTable}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="mt-1 font-semibold">{activeOrder.payment?.status || activeOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="mt-1 font-semibold">
                    {activeOrder.payment?.paidAt
                      ? new Date(activeOrder.payment.paidAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="mt-6 flex items-center gap-2 sm:justify-between">
          <div className="flex w-full gap-2 sm:w-auto">
            {activeOrder.status === "PENDING" ? (
              <Button className="w-full sm:w-auto" onClick={() => onAction("CONFIRMED")}>
                Confirm
              </Button>
            ) : null}
            {activeOrder.status === "CONFIRMED" ? (
              <Button className="w-full sm:w-auto" onClick={() => onAction("SERVED")}>
                Serve
              </Button>
            ) : null}
            {activeOrder.status === "SERVED" ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                onClick={() => onAction("PAID")}
              >
                Mark Paid
              </Button>
            ) : null}
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            {activeOrder.status !== "CANCELLED" && activeOrder.status !== "PAID" ? (
              <Button variant="destructive" onClick={() => onAction("CANCELLED")}>
                Cancel Order
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
