import { useEffect, useMemo, useState } from "react"
import { DollarSign, Loader2, Package, UserCircle, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import { fetchDashboardData, type AdminDashboardResponse } from "@/lib/admin-dashboard-api"

interface StatItem {
  title: string
  value: string
  description: string
  icon: typeof Package
}

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

    void loadData()
  }, [])

  const stats = useMemo<StatItem[]>(() => {
    if (!data || !user) {
      return []
    }

    const items: StatItem[] = [
      {
        title: "Products",
        value: data.totalProducts.toLocaleString(),
        description: "Total products in the system",
        icon: Package,
      },
    ]

    if (["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role)) {
      items.push(
        {
          title: "Revenue",
          value: formatCurrency(data.revenue),
          description: "Total revenue",
          icon: DollarSign,
        },
        {
          title: "Employees",
          value: data.totalEmployee.toLocaleString(),
          description: "Managed employees",
          icon: UserCircle,
        },
      )
    }

    if (user.role === "ROLE_ADMIN") {
      items.push({
        title: "Users",
        value: data.totalUsers.toLocaleString(),
        description: "Registered users",
        icon: Users,
      })
    }

    return items
  }, [data, user])

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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of key system information.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon }: StatItem) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}
