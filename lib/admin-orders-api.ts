const API_BASE_URL = "${process.env.NEXT_PUBLIC_API_URL}"

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
  paymentMethod?: string
}

export interface AdminOrderResponse {
  id: number
  orderSource: string
  tableId: number
  userId: number
  employeeId: number
  status: OrderStatus
  totalAmount: number
  created_at: string
}

export interface OrderItem {
  id?: number
  productId: number
  name: string
  quantity: number
  price: number
}

// Internal Front-end interface representing a full loaded order 
// since backend doesn't return items in AdminOrderResponse yet.
export interface Order extends AdminOrderResponse {
  items: OrderItem[]
  paymentMethod?: string
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
    // Provide a mocked items list since API response does not contain it
    items: [],
    // Provide a mock paymentMethod
    paymentMethod: dto.status === "PAID" ? "CASH" : undefined
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

  // Return the mapped order (mocking items for the detail view)
  const order = mapDtoToOrder(dto)
  order.items = [
    { productId: 1, name: "Sample Coffee", quantity: 2, price: 50 },
    { productId: 2, name: "Latte", quantity: 1, price: 60 }
  ]
  return order
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const res = await fetch("https://cafemanagement-rgd5.onrender.com/admin/orders", {
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
