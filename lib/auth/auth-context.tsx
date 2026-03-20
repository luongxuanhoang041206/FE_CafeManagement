"use client"

import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from "react"
import type { Role, User, AuthToken, AuthState } from "./types"
import { MOCK_USER } from "@/lib/mock-data"
import { adminLogin } from "@/lib/admin-auth-api"

interface AuthContextValue extends AuthState {
  switchRole: (role: Role) => void
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<AuthToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUsername = localStorage.getItem("admin_username")
    const storedRole = localStorage.getItem("admin_role")
    if (storedUsername && storedRole) {
      setUser({
        id: "1",
        name: storedUsername,
        email: "",
        role: storedRole as Role,
      })
    }
    setIsLoading(false)
  }, [])

  const switchRole = useCallback((role: Role) => {
    setUser((prev) =>
      prev ? { ...prev, role } : null
    )
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await adminLogin({ username, password })

      const resolvedUsername = response?.username || username
      const resolvedRole = response?.role || "ROLE_ADMIN"

      localStorage.setItem("admin_username", resolvedUsername)
      localStorage.setItem("admin_role", resolvedRole)

      setUser({
        id: response.id,
        name: resolvedUsername,
        email: "",
        role: resolvedRole as Role,
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("admin_username")
    localStorage.removeItem("admin_role")
    setUser(null)
    setToken(null)
  }, [])

  const refreshSession = useCallback(async () => {
    // Future: POST /api/auth/refresh -> get new JWT
    setToken((prev) =>
      prev
        ? { ...prev, expiresAt: Date.now() + 3600 * 1000 }
        : null
    )
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        switchRole,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
