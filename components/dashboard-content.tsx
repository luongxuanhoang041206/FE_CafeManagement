"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PermissionGuard } from "@/components/permission-guard"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

export function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your workspace activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value="12"
          change="+2 this month"
          icon={Package}
        />
        <StatCard
          title="Revenue"
          value="$24,389"
          change="+12.5% from last month"
          icon={DollarSign}
        />
        <PermissionGuard roles={["ADMIN", "MANAGER"]}>
          <StatCard
            title="Orders"
            value="342"
            change="+8 today"
            icon={ShoppingCart}
          />
        </PermissionGuard>
        <PermissionGuard roles={["ADMIN"]}>
          <StatCard
            title="Active Users"
            value="1,204"
            change="+48 this week"
            icon={Users}
          />
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Product created", detail: "Analytics Dashboard Pro was added", time: "2 hours ago" },
              { action: "Order completed", detail: "Order #1042 was fulfilled", time: "4 hours ago" },
              { action: "User joined", detail: "Sarah Wilson joined the team", time: "6 hours ago" },
              { action: "Product updated", detail: "Cloud Storage Suite price was changed", time: "1 day ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
