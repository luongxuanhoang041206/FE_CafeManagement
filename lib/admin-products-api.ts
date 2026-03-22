// import type { Product } from "@/lib/mock-data"

import { API_URL } from "./api"
const API_BASE_URL = API_URL

// interface AdminProductDto {
//   id: string
//   name: string
//   price: number
//   active: boolean
//   groupid: string
// }

// interface CreateProductRequest {
//   id?: string
//   name: string
//   price: number
//   active: boolean
//   groupId: string
// }

// interface UpdateProductRequest {
//   id: string
//   name: string
//   price: number
//   active: boolean
//   groupId: string
// }

// function mapDtoToProduct(dto: AdminProductDto): Product {
//   return {
//     id: dto.id,
//     name: dto.name,
//     price: dto.price,
//     active: dto.active,
//     groupId: dto.groupid,
//     // Backend schema s not expose these fields; use sensible defaults.
//     createdAt: new Date().toISOString(),
//     description: "",
//   }
// }

// async function handleResponse<T>(res: Response): Promise<T> {
//   if (!res.ok) {
//     const text = await res.text()
//     throw new Error(text || `Request failed with status ${res.status}`)
//   }
//   if (res.status === 204) {
//     return undefined as unknown as T
//   }
//   return (await res.json()) as T
// }

// export async function fetchProductsFromApi(): Promise<Product[]> {
//   const res = await fetch(`${API_BASE_URL}/admin/products`)
//   const data = await handleResponse<AdminProductDto[]>(res)
//   return data.map(mapDtoToProduct)
// }

// export async function saveProduct(product: Product): Promise<Product> {
//   const body: CreateProductRequest | UpdateProductRequest = {
//     id: product.id,
//     name: product.name,
//     price: product.price,
//     active: product.active,
//     groupId: product.groupId,
//   }

//   const hasId = Boolean(product.id)

//   const url = hasId
//     ? `${API_BASE_URL}/admin/products/${encodeURIComponent(product.id)}`
//     : `${API_BASE_URL}/admin/products`

//   const method = hasId ? "PATCH" : "POST"

//   const res = await fetch(url, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   })

//   const dto = await handleResponse<AdminProductDto>(res)
//   return mapDtoToProduct(dto)
// }

// export async function toggleProductStatus(id: string): Promise<Product> {
//   const res = await fetch(
//     `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/status`,
//     {
//       method: "PATCH",
//     },
//   )
//   const dto = await handleResponse<AdminProductDto>(res)
//   return mapDtoToProduct(dto)
// }

// export async function deleteProductById(id: string): Promise<void> {
//   await fetch(
//     `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/delete`,
//     {
//       method: "PATCH",
//     },
//   ).then(async (res) => {
//     await handleResponse<string>(res)
//   })
// }
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
    `${API_BASE_URL}/admin/products?page=${page}&size=${size}`, {
    credentials: "include"
  }
  )
  if (sortBy && direction) {
    res = await fetch(`${API_BASE_URL}/admin/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
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
// export async function fetchProductsFromApi(): Promise<Product[]> {

//   const res = await fetch(
//     `${API_BASE_URL}/admin/products?page=0&size=6&sortBy=createdAt&direction=desc`
//   )

//   const data = await handleResponse<AdminProductDto[]>(res)

//   if (!Array.isArray(data)) {
//     return []
//   }

//   return data.map(mapDtoToProduct)
// }

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
    ? `${API_BASE_URL}/admin/products/${encodeURIComponent(product.id)}`
    : `${API_BASE_URL}/admin/products`

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
    `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/status`,
    { method: "PATCH", credentials: "include" }
  )

  const dto = await handleResponse<AdminProductDto>(res)
  return mapDtoToProduct(dto)
}

export async function deleteProductById(id: string | number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/delete`,
    { method: "DELETE", credentials: "include" }
  )

  await handleResponse(res)
}
