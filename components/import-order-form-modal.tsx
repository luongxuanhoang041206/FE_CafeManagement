"use client"

import { useEffect, useMemo, useState } from "react"
import { MinusCircle, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createImportOrder,
  fetchIngredientsCatalog,
  type CreateImportOrderDraft,
  type ImportOrder,
} from "@/lib/admin-import-orders-api"
import type { Ingredient } from "@/lib/admin-ingredients-api"
import type { Supplier } from "@/lib/admin-suppliers-api"

interface ImportOrderFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
  onCreated: (importOrder: ImportOrder) => void
}

interface ItemRowState {
  ingredientId: string
  quantity: string
  price: string
}

const EMPTY_ITEM: ItemRowState = {
  ingredientId: "",
  quantity: "1",
  price: "",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ImportOrderFormModal({
  open,
  onOpenChange,
  suppliers,
  onCreated,
}: ImportOrderFormModalProps) {
  const [supplierId, setSupplierId] = useState("")
  const [status, setStatus] = useState<"PAID" | "UNPAID">("UNPAID")
  const [items, setItems] = useState<ItemRowState[]>([{ ...EMPTY_ITEM }])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setSupplierId("")
    setStatus("UNPAID")
    setItems([{ ...EMPTY_ITEM }])
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    setLoadingIngredients(true)

    fetchIngredientsCatalog()
      .then((data) => setIngredients(data))
      .catch((error) => {
        console.error("Failed to load ingredients", error)
        toast.error(error instanceof Error ? error.message : "Failed to load ingredients.")
      })
      .finally(() => setLoadingIngredients(false))
  }, [open])

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity)
        const price = Number(item.price)

        if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
          return sum
        }

        return sum + quantity * price
      }, 0),
    [items],
  )

  const isFormValid = useMemo(() => {
    if (!supplierId || items.length === 0) {
      return false
    }

    return items.every((item) => {
      const ingredientId = Number(item.ingredientId)
      const quantity = Number(item.quantity)
      const price = Number(item.price)

      return (
        Number.isInteger(ingredientId) &&
        ingredientId > 0 &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        Number.isFinite(price) &&
        price > 0
      )
    })
  }, [items, supplierId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isFormValid) {
      toast.error("Please select a supplier and complete every item row.")
      return
    }

    const payload: CreateImportOrderDraft = {
      supplierId: Number(supplierId),
      status,
      items: items.map((item) => ({
        ingredientId: Number(item.ingredientId),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    }

    setIsSubmitting(true)

    try {
      const created = await createImportOrder(payload)
      toast.success("Import order created.")
      onCreated(created)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create import order.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Import Order</DialogTitle>
          <DialogDescription>
            Select a supplier, add ingredient lines, and review the total before submitting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: "PAID" | "UNPAID") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">UNPAID</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border">
            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
              <div>
                <p className="font-medium">Items</p>
                <p className="text-sm text-muted-foreground">
                  Add ingredients with quantity and purchase price.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
              >
                <Plus className="size-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4 p-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[1.8fr_0.8fr_1fr_auto]"
                >
                  <div className="space-y-2">
                    <Label>Ingredient</Label>
                    <Select
                      value={item.ingredientId}
                      onValueChange={(value) =>
                        setItems((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, ingredientId: value } : row,
                          ),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingIngredients ? "Loading..." : "Select ingredient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                            {ingredient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, quantity: event.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1000"
                      value={item.price}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, price: event.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setItems((prev) =>
                          prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                      disabled={items.length === 1}
                    >
                      <MinusCircle className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total price</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalPrice)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Submit is disabled until the supplier and all item rows are valid.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting || items.length === 0}>
              {isSubmitting ? "Submitting..." : "Create Import Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
