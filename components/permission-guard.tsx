"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import type { Role } from "@/lib/auth/types"
import { hasRole } from "@/lib/auth/types"

interface PermissionGuardProps {
  roles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ roles, children, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user || !hasRole(user.role, roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
