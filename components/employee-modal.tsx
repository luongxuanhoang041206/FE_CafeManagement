"use client"

import { useEffect, useState } from "react"
import type { Employee } from "@/lib/admin-employees-api"
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

interface EmployeeModalProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (employee: Employee) => void
}

export function EmployeeModal({
  employee,
  open,
  onOpenChange,
  onSave,
}: EmployeeModalProps) {
  const isEdit = !!employee
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    salary: "",
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        position: employee.position,
        phone: employee.phone,
        salary: employee.salary,
      })
    } else {
      setFormData({
        name: "",
        position: "",
        phone: "",
        salary: "",
      })
    }
  }, [employee, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const saved: Employee = {
      id: employee?.id ?? "",
      name: formData.name,
      position: formData.position,
      phone: formData.phone,
      salary: formData.salary,
    }
    await onSave(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the employee details below."
              : "Fill in the details to create a new employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Name</Label>
            <Input
              id="emp-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Employee name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-position">Position</Label>
            <Input
              id="emp-position"
              value={formData.position}
              onChange={(e) =>
                setFormData((p) => ({ ...p, position: e.target.value }))
              }
              placeholder="e.g. Barista, Manager"
              required
              disabled={isEdit}
              title={isEdit ? "Position cannot be edited" : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-phone">Phone</Label>
            <Input
              id="emp-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="Phone number"
              disabled={isEdit}
              title={isEdit ? "Phone cannot be edited" : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-salary">Salary</Label>
            <Input
              id="emp-salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData((p) => ({ ...p, salary: e.target.value }))
              }
              placeholder="e.g. 5000000"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
