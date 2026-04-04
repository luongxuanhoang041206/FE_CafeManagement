"use client"

import { useEffect, useState } from "react"

import type { Supplier, SupplierDraft } from "@/lib/admin-suppliers-api"
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

interface SupplierModalProps {
  supplier: Supplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: SupplierDraft) => Promise<void> | void
}

interface SupplierFormState {
  name: string
  phone: string
  email: string
  address: string
  note: string
}

interface SupplierFormErrors {
  name?: string
  phone?: string
  email?: string
  address?: string
}

const EMPTY_FORM: SupplierFormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  note: "",
}

export function SupplierModal({ supplier, open, onOpenChange, onSave }: SupplierModalProps) {
  const isEdit = Boolean(supplier)
  const [formData, setFormData] = useState<SupplierFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<SupplierFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    if (supplier) {
      setFormData({
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        note: supplier.note ?? "",
      })
    } else {
      setFormData(EMPTY_FORM)
    }

    setErrors({})
    setIsSubmitting(false)
  }, [open, supplier])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = formData.name.trim()
    const trimmedPhone = formData.phone.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedAddress = formData.address.trim()
    const nextErrors: SupplierFormErrors = {}

    if (!trimmedName) {
      nextErrors.name = "Supplier name is required."
    }

    if (!trimmedPhone) {
      nextErrors.phone = "Phone number is required."
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required."
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!trimmedAddress) {
      nextErrors.address = "Address is required."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        id: supplier?.id,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        address: trimmedAddress,
        note: formData.note,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Supplier" : "Create Supplier"}</DialogTitle>
          <DialogDescription>
            Keep supplier contact details organized for import operations and inventory planning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name</Label>
              <Input
                id="supplier-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Highland Beans Co."
              />
              {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="0909 123 456"
              />
              {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-email">Email</Label>
            <Input
              id="supplier-email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="contact@supplier.com"
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-address">Address</Label>
            <Input
              id="supplier-address"
              value={formData.address}
              onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="123 Nguyen Hue, District 1"
            />
            {errors.address ? <p className="text-sm text-destructive">{errors.address}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-note">Note</Label>
            <Textarea
              id="supplier-note"
              value={formData.note}
              onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Optional note about delivery, pricing, or lead time."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
