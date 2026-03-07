"use client"

import { useState } from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard-content"
import { ProductTable } from "@/components/product-table"
import { EmployeeTable } from "@/components/employee-table"
import { UserTable } from "@/components/user-table"
import { PlaceholderPage } from "@/components/placeholder-page"

function DashboardShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("dashboard")

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
            <PlaceholderPage
              title="Orders"
              description="View and manage customer orders."
            />
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
