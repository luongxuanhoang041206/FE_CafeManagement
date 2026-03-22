import { API_URL } from "./api"
const API_BASE_URL = API_URL

export interface Employee {
  id: number
  name: string
  phone: string
  position: string
  salary: string
}

interface AdminEmployeeDto {
  id: number
  name: string
  phone: string
  position: string
  salary: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

interface CreateEmployeeRequest {
  id?: number
  name: string
  position: string
  phone: string
  salary: string
}

interface UpdateEmployeeRequest {
  id: number
  name: string
  position: string
  phone: string
  salary: string
}

function mapDtoToEmployee(dto: AdminEmployeeDto): Employee {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone ?? "",
    position: dto.position ?? "",
    salary: dto.salary ?? "",
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

export async function fetchEmployeesFromApi(
  page: number,
  size: number,
  sortBy?: string,
  direction?: string,
  name?: string
): Promise<{ content: Employee[]; totalPages: number; totalElements: number }> {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("size", String(size))
  if (sortBy && direction) {
    params.set("sortBy", sortBy)
    params.set("direction", direction)
  }
  if (name?.trim()) params.set("name", name.trim())

  const res = await fetch(`${API_BASE_URL}/admin/employee?${params}`, {
    credentials: "include"
  })
  const data = await handleResponse<PageResponse<AdminEmployeeDto>>(res)

  const content = Array.isArray(data.content) ? data.content : []
  const totalPages = Number(data.totalPages) ?? 0
  const totalElements = Number(data.totalElements) ?? 0

  return {
    content: content.map(mapDtoToEmployee),
    totalPages,
    totalElements,
  }
}

export async function saveEmployee(employee: Employee): Promise<Employee> {
  const hasId = Boolean(employee.id)

  if (hasId) {
    const body: UpdateEmployeeRequest = {
      id: employee.id,
      name: employee.name,
      position: employee.position,
      phone: employee.phone,
      salary: employee.salary,
    }
    const res = await fetch(
      `${API_BASE_URL}/admin/employee/${encodeURIComponent(employee.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }
    )
    const dto = await handleResponse<AdminEmployeeDto>(res)
    return mapDtoToEmployee(dto)
  }

  const body: CreateEmployeeRequest = {
    name: employee.name,
    position: employee.position,
    phone: employee.phone,
    salary: employee.salary,
  }
  const res = await fetch(`${API_BASE_URL}/admin/employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })
  const dto = await handleResponse<AdminEmployeeDto>(res)
  return mapDtoToEmployee(dto)
}

export async function deleteEmployeeById(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/admin/employee/${encodeURIComponent(id)}`,
    { method: "DELETE", credentials: "include" }
  )
  await handleResponse(res)
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/employee/${encodeURIComponent(id)}`,
      { credentials: "include" }
    )
    const dto = await handleResponse<AdminEmployeeDto>(res)
    return mapDtoToEmployee(dto)
  } catch {
    return null
  }
}
