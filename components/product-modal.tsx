"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/mock-data"
import { uploadProductImage } from "@/lib/supabase"
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
import { ImagePlus, X } from "lucide-react"

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
    groupId: "" as string | number,
    active: true,
    description: "",
    imageUrl: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        groupId: product.groupId,
        active: product.active,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
      })
      // Show existing image as preview when editing
      setImagePreview(product.imageUrl || null)
      console.log(product)
    } else {
      setFormData({
        name: "",
        price: "",
        groupId: "",
        active: true,
        description: "",
        imageUrl: "",
      })
      setImagePreview(null)
    }
    // Reset file-related state when modal opens/closes
    setImageFile(null)
    setUploadError(null)
  }, [product, open])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setUploadError(null)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setFormData((p) => ({ ...p, imageUrl: "" }))
    setUploadError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsUploading(true)
    setUploadError(null)

    let finalImageUrl = formData.imageUrl

    try {
      // Upload new image to Supabase if a new file was selected
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile)
      }

      const saved: Product = {
        id: product?.id || 0,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        groupId: Number(formData.groupId) || 0,
        active: formData.active,
        description: formData.description,
        imageUrl: finalImageUrl,
        createdAt: product?.createdAt || new Date().toISOString(),
      }
      await onSave(saved)
      onOpenChange(false)
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
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
                type="number"
                value={formData.groupId}
                onChange={(e) => setFormData((p) => ({ ...p, groupId: e.target.value }))}
                placeholder="e.g. 1"
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

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Product Image</Label>

            {imagePreview ? (
              <div className="relative rounded-lg border bg-muted/30 p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-40 rounded-md object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-6 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20"
              >
                <ImagePlus className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload an image</span>
              </label>
            )}

            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
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
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
