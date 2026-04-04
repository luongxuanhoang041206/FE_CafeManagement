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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between pr-4">
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
            <ScrollArea className="mt-2 max-h-[300px] rounded-md border p-4">
              {activeOrder.items && activeOrder.items.length > 0 ? (
                <div className="space-y-4">
                  {activeOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No items listed.
                  <br />
                  <span className="text-xs">(Items may not be returned by API yet)</span>
                </div>
              )}
            </ScrollArea>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{activeOrder.customer?.name || `User #${activeOrder.userId}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Handled By</span>
                <span className="font-medium">{activeOrder.employee?.name || `Employee #${activeOrder.employeeId}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{activeOrder.orderSource}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium">{paymentLabel}</span>
              </div>
              {activeOrder.address ? (
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right font-medium">{activeOrder.address}</span>
                </div>
              ) : null}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(activeOrder.totalAmount || 0).toFixed(2)}</span>
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
