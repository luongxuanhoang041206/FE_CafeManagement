"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <Construction className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">This page is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
