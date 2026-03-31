"use client"

import { useEffect, useState } from "react"
import type { Ingredient, IngredientDraft } from "@/lib/admin-ingredients-api"
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

interface IngredientModalProps {
  ingredient: Ingredient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (ingredient: IngredientDraft) => Promise<void> | void
}

interface IngredientFormState {
  name: string
  stock: string
  unit: string
}

interface IngredientFormErrors {
  name?: string
  stock?: string
  unit?: string
}

const EMPTY_FORM: IngredientFormState = {
  name: "",
  stock: "0",
  unit: "",
}

export function IngredientModal({
  ingredient,
  open,
  onOpenChange,
  onSave,
}: IngredientModalProps) {
  const isEdit = !!ingredient
  const [formData, setFormData] = useState<IngredientFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<IngredientFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    if (ingredient) {
      setFormData({
        name: ingredient.name,
        stock: ingredient.stock.toString(),
        unit: ingredient.unit,
      })
    } else {
      setFormData(EMPTY_FORM)
    }

    setErrors({})
    setIsSubmitting(false)
  }, [ingredient, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = formData.name.trim()
    const trimmedUnit = formData.unit.trim()
    const parsedStock = Number(formData.stock)
    const nextErrors: IngredientFormErrors = {}

    if (!trimmedName) {
      nextErrors.name = "Name is required."
    }

    if (!trimmedUnit) {
      nextErrors.unit = "Unit is required."
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      nextErrors.stock = "Stock must be 0 or greater."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        id: ingredient?.id,
        name: trimmedName,
        stock: parsedStock,
        unit: trimmedUnit,
        createdAt: ingredient?.createdAt,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Ingredient" : "Create Ingredient"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update stock and unit details for this ingredient."
              : "Add a new ingredient to manage inventory in the admin dashboard."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient-name">Name</Label>
            <Input
              id="ingredient-name"
              value={formData.name}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Arabica beans"
              required
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ingredient-stock">Stock</Label>
              <Input
                id="ingredient-stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, stock: event.target.value }))
                }
                placeholder="0"
                required
              />
              {errors.stock ? <p className="text-sm text-destructive">{errors.stock}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredient-unit">Unit</Label>
              <Input
                id="ingredient-unit"
                value={formData.unit}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, unit: event.target.value }))
                }
                placeholder="g, ml, piece"
                required
              />
              {errors.unit ? <p className="text-sm text-destructive">{errors.unit}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Ingredient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
