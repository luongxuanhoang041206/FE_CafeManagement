"use client"

import type { Product } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Ban, Plus } from "lucide-react"

interface ProductCardProps {
  product: Product
  disabled?: boolean
  quantity?: number
  statusLabel?: string | null
  onSelect?: (product: Product) => void
}

export function ProductCard({
  product,
  disabled = false,
  quantity = 0,
  statusLabel,
  onSelect,
}: ProductCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onSelect?.(product)
        }
      }}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-200",
        disabled
          ? "pointer-events-none cursor-not-allowed opacity-40"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary/80 via-primary/50 to-primary/20" />

      <div className="flex flex-1 flex-col gap-4 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground">Product #{product.id}</p>
          </div>

          {statusLabel ? (
            <Badge
              variant={statusLabel === "Out of ingredients" ? "destructive" : "secondary"}
              className="text-[10px]"
            >
              {statusLabel}
            </Badge>
          ) : quantity > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              x{quantity} added
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Available
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Price
            </p>
            <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
            {typeof product.maxQuantity === "number" ? (
              <p className="text-xs text-muted-foreground">Max {product.maxQuantity} in one order</p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full border transition-colors",
              disabled
                ? "border-border bg-muted text-muted-foreground"
                : "border-primary/20 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            {disabled ? <Ban className="size-4" /> : <Plus className="size-4" />}
          </div>
        </div>
      </div>
    </button>
  )
}
