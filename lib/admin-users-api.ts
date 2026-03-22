import { API_URL } from "./api"
const API_BASE_URL = API_URL

export interface AdminUser {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: string
}

interface AdminUserDto {
  id: string
  name: string
  password: string
  email: string
  active: boolean
  created_at: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

function mapDtoToUser(dto: AdminUserDto): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    active: dto.active,
    createdAt: dto.created_at,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  if (res.status === 204) {
    return undefined as unknown as T
  }
  return (await res.json()) as T
}

export async function fetchUsersFromApi(
  page: number,
  size: number,
  name?: string
): Promise<{ content: AdminUser[]; totalPages: number; totalElements: number }> {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("size", String(size))
  if (name?.trim()) params.set("name", name.trim())

  const res = await fetch(`${API_BASE_URL}/admin/user?${params}`, {
    credentials: "include"
  })
  const data = await handleResponse<any>(res)

  const pageData: PageResponse<AdminUserDto> | null =
    data && Array.isArray(data.content)
      ? (data as PageResponse<AdminUserDto>)
      : null

  if (!pageData) {
    return { content: [], totalPages: 0, totalElements: 0 }
  }

  const content = Array.isArray(pageData.content) ? pageData.content : []
  const totalPages = Number(pageData.totalPages) || 0
  const totalElements = Number(pageData.totalElements) || 0

  return {
    content: content.map(mapDtoToUser),
    totalPages,
    totalElements,
  }
}

export async function toggleUserActive(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/user/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
  })
  await handleResponse(res)
}

export async function deleteUserById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/user/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  })
  await handleResponse(res)
}

