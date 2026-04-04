import { useEffect, useMemo, useState } from "react"
import { DollarSign, Loader2, Package, UserCircle, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { fetchDashboardData, type AdminDashboardResponse } from "@/lib/admin-dashboard-api"

type MetricTone = "primary" | "success" | "warning" | "neutral"

interface MetricItem {
  title: string
  value: string
  description: string
  icon: typeof Package
  tone: MetricTone
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

  const metrics = useMemo<MetricItem[]>(() => {
    if (!data || !user) {
      return []
    }

    const items: MetricItem[] = [
      {
        title: "Total Products",
        value: data.totalProducts.toLocaleString(),
        description: "Products currently available in the catalog.",
        icon: Package,
        tone: "primary",
      },
    ]

    if (["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role)) {
      items.push(
        {
          title: "Revenue",
          value: formatCurrency(data.revenue),
          description: "Total revenue recorded across completed activity.",
          icon: DollarSign,
          tone: "success",
        },
        {
          title: "Total Employees",
          value: data.totalEmployee.toLocaleString(),
          description: "Staff members currently managed in the system.",
          icon: UserCircle,
          tone: "warning",
        },
      )
    }

    if (user.role === "ROLE_ADMIN") {
      items.push({
        title: "Total Users",
        value: data.totalUsers.toLocaleString(),
        description: "Registered customers with an account in the platform.",
        icon: Users,
        tone: "neutral",
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

  const greeting = getGreeting(user.role)
  const headlineValue =
    user.role === "ROLE_ADMIN"
      ? `${data.totalUsers.toLocaleString()} users`
      : `${data.totalProducts.toLocaleString()} products`

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-amber-50">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr] lg:p-8">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit bg-background/80">
              Dashboard Overview
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {greeting}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                A quick snapshot of the cafe system so the important numbers are easier to scan at a glance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <HighlightChip label="Catalog" value={data.totalProducts.toLocaleString()} />
              {["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role) ? (
                <HighlightChip label="Revenue" value={formatCurrency(data.revenue)} />
              ) : null}
              {user.role === "ROLE_ADMIN" ? (
                <HighlightChip label="Customers" value={data.totalUsers.toLocaleString()} />
              ) : null}
            </div>
          </div>

          <Card className="border-white/60 bg-background/90 shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-sm text-muted-foreground">Focus summary</p>
              <CardTitle className="text-2xl">{headlineValue}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryRow label="Products in catalog" value={data.totalProducts.toLocaleString()} />
              {["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role) ? (
                <SummaryRow label="Employees managed" value={data.totalEmployee.toLocaleString()} />
              ) : null}
              {user.role === "ROLE_ADMIN" ? (
                <SummaryRow label="Registered users" value={data.totalUsers.toLocaleString()} />
              ) : null}
              {["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role) ? (
                <SummaryRow label="Revenue" value={formatCurrency(data.revenue)} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Key Metrics</h2>
            <p className="text-sm text-muted-foreground">
              Structured counts laid out more clearly for everyday admin work.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon, tone }: MetricItem) {
  const toneClasses: Record<MetricTone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-slate-700",
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className={`flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function HighlightChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getGreeting(role: string) {
  switch (role) {
    case "ROLE_ADMIN":
      return "Admin workspace snapshot"
    case "ROLE_MANAGER":
      return "Manager operations snapshot"
    default:
      return "Cafe workspace snapshot"
  }
}
