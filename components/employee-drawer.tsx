"use client"

import type { Employee } from "@/lib/admin-employees-api"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface EmployeeDrawerProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function EmployeeDrawer({
  employee,
  open,
  onOpenChange,
}: EmployeeDrawerProps) {
  if (!employee) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{employee.name}</SheetTitle>
          <SheetDescription>Employee Details</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4">
          <span className="text-sm text-muted-foreground">{employee.id}</span>
          <Separator />
          <div className="space-y-4">
            <DetailRow label="Position" value={employee.position} />
            <DetailRow label="Phone" value={employee.phone || "—"} />
            <DetailRow label="Salary" value={employee.salary || "—"} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
