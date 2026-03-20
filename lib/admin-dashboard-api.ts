const API_BASE_URL = "http://localhost:8080"

export interface ActivityLog {
  id: number
  type: string
  action: string
  message: string
  createdAt: string
}

export interface AdminDashboardResponse {
  totalProducts: number
  totalUsers: number
  totalEmployee: number
  recentActivities: ActivityLog[]
  revenue: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  const text = await res.text()
  if (!text) {
    return undefined as unknown as T
  }
  return JSON.parse(text)
}

export async function fetchDashboardData(): Promise<AdminDashboardResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse<AdminDashboardResponse>(res)
}
