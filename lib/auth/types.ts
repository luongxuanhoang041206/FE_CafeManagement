// Role hierarchy: ADMIN > MANAGER > STAFF
export type Role = "ADMIN" | "MANAGER" | "STAFF"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

// Structure prepared for future JWT integration
export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  token: AuthToken | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Permission definitions for each role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    "view:dashboard",
    "view:products",
    "create:products",
    "edit:products",
    "delete:products",
    "toggle:products",
    "view:employees",
    "create:employees",
    "edit:employees",
    "delete:employees",
    "view:orders",
    "view:users",
    "manage:users",
    "view:settings",
    "manage:settings",
  ],
  MANAGER: [
    "view:dashboard",
    "view:products",
    "edit:products",
    "toggle:products",
    "view:employees",
    "edit:employees",
    "view:orders",
  ],
  STAFF: [
    "view:dashboard",
    "view:products",
    "view:employees",
  ],
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole)
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
}

export const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-primary/10", text: "text-primary" },
  MANAGER: { bg: "bg-chart-2/10", text: "text-chart-2" },
  STAFF: { bg: "bg-muted-foreground/10", text: "text-muted-foreground" },
}
