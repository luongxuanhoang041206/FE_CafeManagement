import { adminHttp } from "./admin-http"

export interface Supplier {
  id: number
  name: string
  phone: string
  email: string
  address: string
  note?: string
  createdAt: string
}

export interface SupplierDraft {
  id?: number
  name: string
  phone: string
  email: string
  address: string
  note?: string
}

interface SupplierDto {
  id: number
  name: string
  phone: string
  email: string
  address: string
  note?: string
  createdAt: string
}

function mapSupplier(dto: SupplierDto): Supplier {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    email: dto.email,
    address: dto.address,
    note: dto.note,
    createdAt: dto.createdAt,
  }
}

function toPayload(draft: SupplierDraft) {
  return {
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    address: draft.address.trim(),
    note: draft.note?.trim() || undefined,
  }
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await adminHttp.get<SupplierDto[]>("/admin/suppliers")
  return data.map(mapSupplier)
}

export async function saveSupplier(draft: SupplierDraft): Promise<Supplier> {
  const payload = toPayload(draft)
  const { data } =
    typeof draft.id === "number"
      ? await adminHttp.put<SupplierDto>(`/admin/suppliers/${draft.id}`, payload)
      : await adminHttp.post<SupplierDto>("/admin/suppliers", payload)

  return mapSupplier(data)
}

export async function deleteSupplier(id: number): Promise<void> {
  await adminHttp.delete(`/admin/suppliers/${id}`)
}
