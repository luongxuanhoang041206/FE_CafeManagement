"use client"

import type { Product } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface ProductDrawerProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDrawer({ product, open, onOpenChange }: ProductDrawerProps) {
  if (!product) return null
  console.log("Product data:", product)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>Product Details</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4">
          {/* Product Image */}
          {product.imageUrl && (
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-48 w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={product.active ? "default" : "secondary"}>
              {product.active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground">{product.id}</span>
          </div>

          <Separator />

          <div className="space-y-4">
            <DetailRow label="Price" value={`$${product.price.toFixed(2)}`} />
            <DetailRow label="Group ID" value={product.groupId} />
            <DetailRow label="Created" value={new Date(product.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
          </div>

          <Separator />

          {product.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Description</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
