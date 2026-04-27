"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DollarSign,
  Loader2,
  Package,
  UserCircle,
  Users,
  Coffee,
  Activity,
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"
import {
  fetchDashboardData,
  type AdminDashboardResponse,
} from "@/lib/admin-dashboard-api"

interface StatItem {
  title: string
  value: string
  description: string
  icon: typeof Package
  gradient: string
  iconBg: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
        description: "Total products in catalog",
        icon: Package,
        gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
        iconBg: "bg-blue-500/15 text-blue-600",
      },
    ]

    if (["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role)) {
      items.push(
        {
          title: "Revenue",
          value: formatCurrency(data.revenue),
          description: "Total revenue earned",
          icon: DollarSign,
          gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
          iconBg: "bg-emerald-500/15 text-emerald-600",
        },
        {
          title: "Employees",
          value: data.totalEmployee.toLocaleString(),
          description: "Active team members",
          icon: UserCircle,
          gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
          iconBg: "bg-violet-500/15 text-violet-600",
        },
      )
    }

    if (user.role === "ROLE_ADMIN") {
      items.push({
        title: "Users",
        value: data.totalUsers.toLocaleString(),
        description: "Registered accounts",
        icon: Users,
        gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
        iconBg: "bg-amber-500/15 text-amber-600",
      })
    }

    return items
  }, [data, user])

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
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

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening"

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero Welcome Section */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5" />
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/3" />

          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coffee className="size-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Cafe Management
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {greeting}, {user.name.split(" ")[0]}!
              </h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Here&apos;s an overview of your cafe&apos;s performance. Monitor
                key metrics and stay on top of your business.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border bg-card/80 px-4 py-2 shadow-sm backdrop-blur-sm sm:flex">
              <Activity className="size-4 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">
                System Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        variants={container}
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  )
}

function StatCard({ title, value, description, icon: Icon, gradient, iconBg }: StatItem) {
  return (
    <Card className="group relative overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
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
