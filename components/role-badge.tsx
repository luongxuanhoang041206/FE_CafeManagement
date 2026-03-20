// "use client"

// import { Badge } from "@/components/ui/badge"
// import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/auth/types"
// import { cn } from "@/lib/utils"
// import { Shield, ShieldCheck, User } from "lucide-react"

// const ROLE_ICONS: Record<Role, typeof Shield> = {
//   ROLE_ADMIN: ShieldCheck,
//   ROLE_MANAGER: Shield,
//   ROLE_STAFF: User,
// }

// interface RoleBadgeProps {
//   role: Role
//   className?: string
//   showIcon?: boolean
// }

// export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
//   const Icon = ROLE_ICONS[role]
//   const colors = ROLE_COLORS[role]

//   return (
//     <Badge
//       variant="secondary"
//       className={cn(
//         "gap-1 font-medium border-0",
//         colors.bg,
//         colors.text,
//         className,
//       )}
//     >
//       {showIcon && <Icon className="size-3" />}
//       {ROLE_LABELS[role]}
//     </Badge>
//   )
// }
"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Define types và constants ngay trong file này
type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_STAFF' | 'ROLE_EMPLOYEE'

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ROLE_ADMIN: { bg: "bg-red-100", text: "text-red-700" },
  ROLE_MANAGER: { bg: "bg-blue-100", text: "text-blue-700" },
  ROLE_STAFF: { bg: "bg-green-100", text: "text-green-700" },
  ROLE_EMPLOYEE: { bg: "bg-green-100", text: "text-green-700" },
  // Fallback cho trường hợp không có prefix
  ADMIN: { bg: "bg-red-100", text: "text-red-700" },
  MANAGER: { bg: "bg-blue-100", text: "text-blue-700" },
  STAFF: { bg: "bg-green-100", text: "text-green-700" },
  EMPLOYEE: { bg: "bg-green-100", text: "text-green-700" },
}

const ROLE_ICONS: Record<string, any> = {
  ROLE_ADMIN: ShieldCheck,
  ROLE_MANAGER: Shield,
  ROLE_STAFF: User,
  ROLE_EMPLOYEE: User,
  ADMIN: ShieldCheck,
  MANAGER: Shield,
  STAFF: User,
  EMPLOYEE: User,
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_MANAGER: "Manager",
  ROLE_STAFF: "Staff",
  ROLE_EMPLOYEE: "Employee",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  EMPLOYEE: "Employee",
}

interface RoleBadgeProps {
  role: string | Role
  className?: string
  showIcon?: boolean
}

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  // Safety check
  if (!role) {
    return (
      <Badge variant="secondary" className={cn("gap-1 font-medium", className)}>
        <User className="size-3" />
        Unknown
      </Badge>
    )
  }

  // Get values with fallback
  const Icon = ROLE_ICONS[role] || User
  const colors = ROLE_COLORS[role] || { bg: "bg-gray-100", text: "text-gray-700" }
  const label = ROLE_LABELS[role] || role

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
      {label}
    </Badge>
  )
}
