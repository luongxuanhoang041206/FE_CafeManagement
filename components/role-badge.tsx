"use client"

import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/auth/types"
import { cn } from "@/lib/utils"
import { Shield, ShieldCheck, User } from "lucide-react"

const ROLE_ICONS: Record<Role, typeof Shield> = {
  ADMIN: ShieldCheck,
  MANAGER: Shield,
  STAFF: User,
}

interface RoleBadgeProps {
  role: Role
  className?: string
  showIcon?: boolean
}

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  const Icon = ROLE_ICONS[role]
  const colors = ROLE_COLORS[role]

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-medium border-0",
        colors.bg,
        colors.text,
        className,
      )}
    >
      {showIcon && <Icon className="size-3" />}
      {ROLE_LABELS[role]}
    </Badge>
  )
}
