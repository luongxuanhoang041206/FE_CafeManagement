
import { API_URL } from "./api"
const API_BASE_URL = API_URL
import type { Product } from "@/lib/mock-data"

// API_BASE_URL is now imported from ./api

interface AdminProductDto {
  id: number
  name: string
  price: number
  active: boolean
  groupId: string
  imageUrl?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

interface CreateProductRequest {
  name: string
  price: number
  active: boolean
  groupId: string
  imageUrl?: string
}

interface UpdateProductRequest {
  name: string
  price: number
  active: boolean
  groupId: string
  imageUrl?: string
}

function mapDtoToProduct(dto: AdminProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    active: dto.active,
    groupId: dto.groupId,
    createdAt: new Date().toISOString(),
    description: "",
    imageUrl: dto.imageUrl || "",
  }
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

export async function fetchProductsFromApi(
  page: number,
  size: number,
  sortBy?: string,
  direction?: string
): Promise<{ content: Product[]; totalPages: number; totalElements: number }> {

  let res = await fetch(
    `https://cafemanagement-rgd5.onrender.com/admin/products?page=${page}&size=${size}`, {
    credentials: "include"
  }
  )
  if (sortBy && direction) {
    res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
      credentials: "include"
    })
  }

  const data = await handleResponse<PageResponse<AdminProductDto>>(res)

  return {
    content: data.content.map(mapDtoToProduct),
    totalPages: data.totalPages,
    totalElements: data.totalElements,
  }
}


export async function saveProduct(product: Product): Promise<Product> {
  const body: CreateProductRequest | UpdateProductRequest = {
    name: product.name,
    price: product.price,
    active: product.active,
    groupId: product.groupId,
    imageUrl: product.imageUrl || "",
  }

  const hasId = Boolean(product.id)

  const url = hasId
    ? `https://cafemanagement-rgd5.onrender.com/admin/products/${encodeURIComponent(product.id)}`
    : `https://cafemanagement-rgd5.onrender.com/admin/products`

  const method = hasId ? "PATCH" : "POST"

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  })

  const dto = await handleResponse<AdminProductDto>(res)
  return mapDtoToProduct(dto)
}

export async function toggleProductStatus(id: string | number): Promise<Product> {
  const res = await fetch(
    `https://cafemanagement-rgd5.onrender.com/admin/products/${encodeURIComponent(id)}/status`,
    { method: "PATCH", credentials: "include" }
  )

  const dto = await handleResponse<AdminProductDto>(res)
  return mapDtoToProduct(dto)
}

export async function deleteProductById(id: string | number): Promise<void> {
  const res = await fetch(
    `https://cafemanagement-rgd5.onrender.com/admin/products/${encodeURIComponent(id)}/delete`,
    { method: "DELETE", credentials: "include" }
  )

  await handleResponse(res)
}
