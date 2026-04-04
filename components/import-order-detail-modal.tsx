"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  fetchImportOrderById,
  type ImportOrder,
} from "@/lib/admin-import-orders-api"

interface ImportOrderDetailModalProps {
  importOrder: ImportOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ImportOrderDetailModal({
  importOrder,
  open,
  onOpenChange,
}: ImportOrderDetailModalProps) {
  const [detail, setDetail] = useState<ImportOrder | null>(importOrder)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !importOrder) {
      return
    }

    setLoading(true)

    fetchImportOrderById(importOrder.id)
      .then((data) => setDetail(data))
      .catch(() => setDetail(importOrder))
      .finally(() => setLoading(false))
  }, [importOrder, open])

  const activeOrder = detail ?? importOrder

  if (!activeOrder) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle>Import Order #{activeOrder.id}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Created on {new Date(activeOrder.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={activeOrder.status === "PAID" ? "default" : "secondary"}>
              {activeOrder.status}
            </Badge>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Supplier Name</p>
                <p className="mt-1 font-semibold">{activeOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="mt-1 font-semibold">
                  {new Date(activeOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {formatCurrency(activeOrder.totalPrice)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrder.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        No items found for this import order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeOrder.items.map((item) => (
                      <TableRow key={item.id ?? `${item.ingredientId}-${item.ingredientName}`}>
                        <TableCell className="font-medium">{item.ingredientName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
