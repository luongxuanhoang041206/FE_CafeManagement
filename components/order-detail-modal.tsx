"use client"

import { useEffect, useState } from "react"
import { Order, OrderStatus, getOrderById } from "@/lib/admin-orders-api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { STATUS_COLORS } from "./order-table"
import { Loader2 } from "lucide-react"

interface OrderDetailModalProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (status: OrderStatus) => void
}

export function OrderDetailModal({ order, open, onOpenChange, onUpdateStatus }: OrderDetailModalProps) {
  const [fullOrder, setFullOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && order.id) {
      setLoading(true)
      getOrderById(order.id)
        .then(data => setFullOrder(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, order.id])

  // Sync state if order prop gets updated from parent (e.g. status changes)
  useEffect(() => {
    if (fullOrder && order.status !== fullOrder.status) {
      setFullOrder(prev => prev ? { ...prev, status: order.status } : null)
    }
  }, [order.status, fullOrder])

  const onAction = async (status: OrderStatus) => {
    onUpdateStatus(status)
    // Note: the parent updates its own state, which flows down via the `order` prop
  }

  const actOrder = fullOrder || order

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-start pr-4">
            <div>
              <DialogTitle className="text-xl">Order #{actOrder.id}</DialogTitle>
              <DialogDescription className="mt-1">
                {new Date(actOrder.created_at).toLocaleString()} • Table {actOrder.tableId}
              </DialogDescription>
            </div>
            <Badge variant="outline" className={STATUS_COLORS[actOrder.status]}>
              {actOrder.status}
            </Badge>
          </div>
        </DialogHeader>

        {loading && !fullOrder ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px] mt-2 border rounded-md p-4">
              {actOrder.items && actOrder.items.length > 0 ? (
                <div className="space-y-4">
                  {actOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
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
                <div className="text-center text-sm text-muted-foreground py-4">
                  No items listed. 
                  <br/><span className="text-xs">(Items may not be returned by API yet)</span>
                </div>
              )}
            </ScrollArea>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{actOrder.orderSource}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium">{actOrder.paymentMethod || (actOrder.status === 'PAID' ? "PAID" : "UNPAID")}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(actOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="mt-6 flex sm:justify-between items-center gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {actOrder.status === "PENDING" && (
              <Button className="w-full sm:w-auto" onClick={() => onAction("CONFIRMED")}>Confirm</Button>
            )}
            {actOrder.status === "CONFIRMED" && (
              <Button className="w-full sm:w-auto" onClick={() => onAction("SERVED")}>Serve</Button>
            )}
            {actOrder.status === "SERVED" && (
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={() => onAction("PAID")}>Mark Paid</Button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {actOrder.status !== "CANCELLED" && actOrder.status !== "PAID" && (
              <Button variant="destructive" onClick={() => onAction("CANCELLED")}>Cancel Order</Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
