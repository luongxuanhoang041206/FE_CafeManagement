"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import type { Role, User, AuthToken, AuthState } from "./types"
import { MOCK_USER } from "@/lib/mock-data"

interface AuthContextValue extends AuthState {
  switchRole: (role: Role) => void
  // Prepared for future JWT integration
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER)
  const [token, setToken] = useState<AuthToken | null>({
    // Mock token for demo; will be replaced with real JWT
    accessToken: "mock_jwt_access_token",
    refreshToken: "mock_jwt_refresh_token",
    expiresAt: Date.now() + 3600 * 1000,
  })

  const switchRole = useCallback((role: Role) => {
    setUser((prev) =>
      prev ? { ...prev, role } : null
    )
  }, [])

  // Stub for real JWT login
  const login = useCallback(async (_email: string, _password: string) => {
    // Future: POST /api/auth/login -> receive JWT
    // For now, just set the mock user
    setUser(MOCK_USER)
    setToken({
      accessToken: "mock_jwt_access_token",
      refreshToken: "mock_jwt_refresh_token",
      expiresAt: Date.now() + 3600 * 1000,
    })
  }, [])

  const logout = useCallback(() => {
    // Future: POST /api/auth/logout -> invalidate JWT
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
        isLoading: false,
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
