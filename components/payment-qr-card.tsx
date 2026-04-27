"use client"

import { Loader2, QrCode } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

interface PaymentQrCardProps {
  orderId: number
  totalAmount: number
  qrDataUrl?: string | null
  loading?: boolean
  errorMessage?: string | null
}

export function PaymentQrCard({
  orderId,
  totalAmount,
  qrDataUrl,
  loading = false,
  errorMessage,
}: PaymentQrCardProps) {
  return (
    <div className="rounded-2xl border bg-muted/10 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <QrCode className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Thanh toan bang VietQR</h3>
          <p className="text-sm text-muted-foreground">
            Quet ma QR ben duoi de hoan tat thanh toan cho don hang.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Ma don hang</p>
          <p className="mt-1 font-semibold">#{orderId}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tong tien</p>
          <p className="mt-1 font-semibold text-primary">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        {loading ? (
          <div className="flex min-h-64 w-full max-w-xs flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p>Dang tao ma QR thanh toan...</p>
          </div>
        ) : qrDataUrl ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <img
              src={qrDataUrl}
              alt={`VietQR cho don hang ${orderId}`}
              className="h-64 w-64 object-contain"
            />
          </div>
        ) : (
          <div className="flex min-h-64 w-full max-w-xs items-center justify-center rounded-2xl border border-dashed bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            {errorMessage || "Khong tao duoc ma QR, vui long thu lai."}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Mo ung dung ngan hang ho tro VietQR, quet ma va kiem tra dung ma don truoc khi xac nhan thanh toan.
      </div>

      {errorMessage && !qrDataUrl ? (
        <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
}
