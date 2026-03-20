import { LoginAdminRequest } from "@/lib/auth/types"

const API_BASE_URL = "http://localhost:8080"

export async function adminLogin(credentials: LoginAdminRequest): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Login failed with status ${res.status}`)
  }

  const text = await res.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    // If the server returns a simple string (e.g. JWT token directly)
    return { token: text }
  }
}
