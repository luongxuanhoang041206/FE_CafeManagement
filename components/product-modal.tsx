"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/mock-data"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface ProductModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
}

export function ProductModal({ product, open, onOpenChange, onSave }: ProductModalProps) {
  const isEdit = !!product
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    groupId: "",
    active: true,
    description: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        groupId: product.groupId,
        active: product.active,
        description: product.description || "",
      })
    } else {
      setFormData({
        name: "",
        price: "",
        groupId: "",
        active: true,
        description: "",
      })
    }
  }, [product, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const saved: Product = {
      id: product?.id || "",
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      groupId: formData.groupId,
      active: formData.active,
      description: formData.description,
      createdAt: product?.createdAt || new Date().toISOString(),
    }
    await onSave(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the product details below." : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Product name"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="groupId">Group ID</Label>
              <Input
                id="groupId"
                value={formData.groupId}
                onChange={(e) => setFormData((p) => ({ ...p, groupId: e.target.value }))}
                placeholder="GRP-X"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Product description..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((p) => ({ ...p, active: !!checked }))}
            />
            <Label htmlFor="active" className="text-sm">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
