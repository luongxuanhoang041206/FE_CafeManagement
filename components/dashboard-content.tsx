import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Package, Users, UserCircle, Loader2 } from "lucide-react"
import { fetchDashboardData, AdminDashboardResponse } from "@/lib/admin-dashboard-api"

export function DashboardContent() {
  const { user } = useAuth()
  const [data, setData] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await fetchDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your workspace activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* All roles see Products */}
        <StatCard
          title="Total Products"
          value={data.totalProducts.toLocaleString()}
          change="Total items in catalog"
          icon={Package}
        />

        {/* Admin and Manager see Revenue and Employees */}
        {["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role) && (
          <>
            <StatCard
              title="Revenue"
              value={`$${data.revenue.toLocaleString()}`}
              change="Total generated revenue"
              icon={DollarSign}
            />
            <StatCard
              title="Total Employees"
              value={data.totalEmployee.toLocaleString()}
              change="Active staff members"
              icon={UserCircle}
            />
          </>
        )}

        {/* Only Admin sees Users */}
        {user.role === "ROLE_ADMIN" && (
          <StatCard
            title="Total Users"
            value={data.totalUsers.toLocaleString()}
            change="Registered customers"
            icon={Users}
          />
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  icon: typeof Package
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  )
}
