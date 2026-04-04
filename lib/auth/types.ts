// Role hierarchy: ADMIN > MANAGER > STAFF
export type Role = "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_STAFF"

export interface LoginAdminRequest {
  username?: string;
  password?: string;
}

export interface User {
  id: string
  name: string
  email?: string
  role: Role
  avatarUrl?: string
}

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

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ROLE_ADMIN: [
    "view:dashboard",
    "view:products",
    "create:products",
    "edit:products",
    "delete:products",
    "toggle:products",
    "view:ingredients",
    "create:ingredients",
    "edit:ingredients",
    "delete:ingredients",
    "view:employees",
    "create:employees",
    "edit:employees",
    "delete:employees",
    "view:orders",
    "create:orders",
    "edit:orders",
    "view:suppliers",
    "create:suppliers",
    "edit:suppliers",
    "delete:suppliers",
    "view:import-orders",
    "create:import-orders",
    "view:users",
    "manage:users",
    "view:settings",
    "manage:settings",
  ],
  ROLE_MANAGER: [
    "view:dashboard",
    "view:products",
    "create:products",
    "edit:products",
    "toggle:products",
    "view:employees",
    "create:employees",
    "edit:employees",
    "delete:employees",
    "view:orders",
    "create:orders",
    "edit:orders",
    "view:suppliers",
    "create:suppliers",
    "edit:suppliers",
    "delete:suppliers",
    "view:import-orders",
    "create:import-orders",
    "order:create",
    "order:cancel",
  ],
  ROLE_STAFF: [
    "view:dashboard",
    "view:products",
    "view:orders",
    "create:orders",
    "edit:orders",
    "view:suppliers",
    "view:import-orders",
  ],
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole)
}

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_MANAGER: "Manager",
  ROLE_STAFF: "Staff",
}

export const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  ROLE_ADMIN: { bg: "bg-primary/10", text: "text-primary" },
  ROLE_MANAGER: { bg: "bg-chart-2/10", text: "text-chart-2" },
  ROLE_STAFF: { bg: "bg-muted-foreground/10", text: "text-muted-foreground" },
}
