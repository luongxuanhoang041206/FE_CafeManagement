"use client"

import { useAuth } from "@/lib/auth/auth-context"
import type { Role } from "@/lib/auth/types"
import { ROLE_LABELS } from "@/lib/auth/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RoleBadge } from "@/components/role-badge"
import { FlaskConical } from "lucide-react"

const ALL_ROLES: Role[] = ["ADMIN", "MANAGER", "STAFF"]

export function RoleSwitcher() {
  const { user, switchRole } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-1.5">
      <FlaskConical className="size-3.5 text-primary" />
      <span className="text-xs font-medium text-primary">Demo</span>
      <Select value={user.role} onValueChange={(v) => switchRole(v as Role)}>
        <SelectTrigger className="h-7 w-[120px] border-primary/20 bg-card text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALL_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <RoleBadge role={role} showIcon={false} className="text-[10px] px-1.5 py-0" />
                <span className="text-xs">{ROLE_LABELS[role]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
