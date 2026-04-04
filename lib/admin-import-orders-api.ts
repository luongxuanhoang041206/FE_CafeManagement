import { adminHttp } from "./admin-http"
import type { Ingredient } from "./admin-ingredients-api"

export type ImportOrderStatus = "PAID" | "UNPAID"

export interface ImportOrderItem {
  id?: number
  ingredientId: number
  ingredientName: string
  quantity: number
  price: number
  lineTotal: number
}

export interface ImportOrder {
  id: number
  supplierName: string
  totalPrice: number
  status: ImportOrderStatus
  createdAt: string
  items: ImportOrderItem[]
}

export interface CreateImportOrderItemDraft {
  ingredientId: number
  quantity: number
  price: number
}

export interface CreateImportOrderDraft {
  supplierId: number
  status: ImportOrderStatus
  items: CreateImportOrderItemDraft[]
}

interface ImportOrderItemDto {
  id?: number
  ingredientId: number
  ingredientName: string
  quantity: number
  price: number
  lineTotal?: number
}

interface ImportOrderDto {
  id: number
  supplierName: string
  totalPrice: number
  status: ImportOrderStatus
  createdAt: string
  items?: ImportOrderItemDto[]
}

function mapImportOrder(dto: ImportOrderDto): ImportOrder {
  return {
    id: dto.id,
    supplierName: dto.supplierName,
    totalPrice: dto.totalPrice,
    status: dto.status,
    createdAt: dto.createdAt,
    items: (dto.items ?? []).map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.lineTotal ?? item.price * item.quantity,
    })),
  }
}

export async function fetchImportOrders(): Promise<ImportOrder[]> {
  const { data } = await adminHttp.get<ImportOrderDto[]>("/admin/import-orders")
  return data.map(mapImportOrder)
}

export async function fetchImportOrderById(id: number): Promise<ImportOrder> {
  const { data } = await adminHttp.get<ImportOrderDto>(`/admin/import-orders/${id}`)
  return mapImportOrder(data)
}

export async function createImportOrder(draft: CreateImportOrderDraft): Promise<ImportOrder> {
  const { data } = await adminHttp.post<ImportOrderDto>("/admin/import-orders", {
    supplierId: draft.supplierId,
    status: draft.status,
    items: draft.items.map((item) => ({
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      price: item.price,
    })),
  })

  return mapImportOrder(data)
}

export async function fetchIngredientsCatalog(): Promise<Ingredient[]> {
  const { data } = await adminHttp.get<Ingredient[]>("/admin/ingredients")
  return data
}
