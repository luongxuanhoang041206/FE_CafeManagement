import { API_URL } from "./api"

const API_BASE_URL = API_URL || "https://cafemanagement-rgd5.onrender.com"

export interface Ingredient {
  id: number
  name: string
  stock: number
  unit: string
  createdAt: string
}

export type IngredientDraft = Omit<Ingredient, "id" | "createdAt"> & {
  id?: number
  createdAt?: string
}

interface IngredientResponse {
  id: number
  name: string
  stock: number
  unit: string
  createdAt: string
}

interface IngredientRequest {
  name: string
  stock: number
  unit: string
}

function mapDtoToIngredient(dto: IngredientResponse): Ingredient {
  return {
    id: dto.id,
    name: dto.name,
    stock: dto.stock,
    unit: dto.unit,
    createdAt: dto.createdAt,
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

function toRequestBody(ingredient: IngredientDraft): IngredientRequest {
  return {
    name: ingredient.name.trim(),
    stock: ingredient.stock,
    unit: ingredient.unit.trim(),
  }
}

export async function fetchIngredientsFromApi(): Promise<Ingredient[]> {
  const res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/ingredients`, {
    credentials: "include",
  })

  const data = await handleResponse<IngredientResponse[]>(res)
  return data.map(mapDtoToIngredient)
}

export async function saveIngredient(ingredient: IngredientDraft): Promise<Ingredient> {
  const hasId = typeof ingredient.id === "number"
  const url = hasId
    ? `https://cafemanagement-rgd5.onrender.com/admin/ingredients/${encodeURIComponent(ingredient.id!)}`
    : `https://cafemanagement-rgd5.onrender.com/admin/ingredients`

  const res = await fetch(url, {
    method: hasId ? "PUT" : "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toRequestBody(ingredient)),
  })

  const data = await handleResponse<IngredientResponse>(res)
  return mapDtoToIngredient(data)
}

export async function deleteIngredientById(id: number): Promise<void> {
  const res = await fetch(`https://cafemanagement-rgd5.onrender.com/admin/ingredients/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  })

  await handleResponse(res)
}
