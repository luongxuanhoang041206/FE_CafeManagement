import { API_URL } from "./api"

const API_BASE_URL = API_URL || "https://cafemanagement-rgd5.onrender.com"

export type OrderStatus = "PENDING" | "CONFIRMED" | "SERVED" | "PAID" | "CANCELLED"

export interface CreateOrderItemRequest {
  productId: number
  quantity: number
  price: number
}

export interface CreateOrderRequest {
  orderSource: string
  tableId: number
  userId: number
  employeeId: number
  status: string
  totalAmount: number
  created_at?: string
  items: CreateOrderItemRequest[]
  methodPayment?: string
}

export interface AdminOrderResponse {
  id: number
  orderSource: string
  tableId: number
  tableLabel?: string
  userId: number
  employeeId: number
  status: OrderStatus
  totalAmount: number
  created_at: string
  methodPayment?: string
  address?: string
  customer?: {
    id: number
    name: string
    username?: string
    email?: string
  }
  employee?: {
    id: number
    name: string
    position?: string
    phone?: string
  }
  payment?: {
    id: number
    method?: string
    amount?: number
    status?: string
    paidAt?: string
  }
  items?: Array<{
    id?: number
    productId: number
    productName?: string
    quantity: number
    price: number
    lineTotal?: number
  }>
}

export interface OrderItem {
  id?: number
  productId: number
  name: string
  quantity: number
  price: number
  lineTotal?: number
}

export interface Order extends AdminOrderResponse {
  items: OrderItem[]
  methodPayment?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  const text = await res.text()
  if (!text) return undefined as unknown as T
  return JSON.parse(text)
}

function mapDtoToOrder(dto: AdminOrderResponse): Order {
  return {
    ...dto,
    items: (dto.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.productName ?? `Product #${item.productId}`,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.lineTotal ?? item.price * item.quantity,
    })),
    methodPayment: dto.methodPayment ?? dto.payment?.method ?? (dto.status === "PAID" ? "CASH" : undefined),
  }
}

export async function fetchOrdersFromApi(
  page: number = 0,
  size: number = 10,
  sortBy: string = "id",
  direction: string = "desc",
  status?: string,
  tableId?: number
): Promise<{ content: Order[]; totalPages: number; totalElements: number }> {

  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("size", size.toString())
  params.append("sortBy", sortBy)
  params.append("direction", direction)

  if (status) params.append("status", status)
  if (tableId) params.append("tableId", tableId.toString())

  // Note: we can also add fromDate, toDate etc if needed

  const res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/orders?${params.toString()}`, {
    credentials: "include"
  })
  const data = await handleResponse<PageResponse<AdminOrderResponse>>(res)

  return {
    content: data.content.map(mapDtoToOrder),
    totalPages: data.totalPages,
    totalElements: data.totalElements,
  }
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
    credentials: "include"
  })
  const dto = await handleResponse<AdminOrderResponse>(res)
  return mapDtoToOrder(dto)
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/orders`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const dto = await handleResponse<AdminOrderResponse>(res)
  return mapDtoToOrder(dto)
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/orders/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  const dto = await handleResponse<AdminOrderResponse>(res)
  return mapDtoToOrder(dto)
}
