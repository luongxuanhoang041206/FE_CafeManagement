export interface VietQRPayload {
  qrCode: string
  qrDataURL: string
}

interface VietQRResponse {
  code?: string
  desc?: string
  data?: VietQRPayload
}

interface GenerateVietQRParams {
  orderId: number
  totalAmount: number
  orderCode?: string
}

export function isVietQrPayment(method?: string | null) {
  return method?.toUpperCase() === "VIETQR"
}

export async function generateVietQr({
  orderId,
  totalAmount,
  orderCode = `ORDER_${orderId}`,
}: GenerateVietQRParams): Promise<VietQRPayload> {
  const params = new URLSearchParams({
    orderId: String(orderId),
    totalAmount: String(totalAmount),
    orderCode,
  })

  const response = await fetch(`http://localhost:10000/api/qr-code/generate?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Khong tao duoc ma QR, vui long thu lai.")
  }

  const payload = (await response.json()) as VietQRResponse

  if (payload.code !== "00" || !payload.data?.qrDataURL) {
    throw new Error("Khong tao duoc ma QR, vui long thu lai.")
  }

  return payload.data
}
