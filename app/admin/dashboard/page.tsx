"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard-content"
import { ProductTable } from "@/components/product-table"
import { IngredientTable } from "@/components/ingredient-table"
import { EmployeeTable } from "@/components/employee-table"
import { UserTable } from "@/components/user-table"
import { PlaceholderPage } from "@/components/placeholder-page"
import { OrderTable } from "@/components/order-table"

function DashboardShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("dashboard")
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {activePage === "dashboard" && <DashboardContent />}
          {activePage === "products" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                  Product Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your product catalog, pricing, and availability.
                </p>
              </div>
              <ProductTable />
            </div>
          )}
          {activePage === "ingredients" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                  Ingredient Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track ingredient stock, units, and freshness across the cafe.
                </p>
              </div>
              <IngredientTable />
            </div>
          )}
          {activePage === "employees" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                  Employee Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage employees, positions, and salary.
                </p>
              </div>
              <EmployeeTable />
            </div>
          )}
          {activePage === "orders" && (
            <div className="space-y-6">
              <OrderTable />
            </div>
          )}
          {activePage === "users" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage system users and account status.
                </p>
              </div>
              <UserTable />
            </div>
          )}
          {activePage === "settings" && (
            <PlaceholderPage
              title="Settings"
              description="Configure your workspace preferences."
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <DashboardShell />
    </AuthProvider>
  )
}
export const dynamic = 'force-dynamic'
