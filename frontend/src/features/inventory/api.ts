import { api } from "@/lib/api/client"
import type {
  InventoryAdjustmentRequest,
  InventoryCreateRequest,
  InventoryResponse,
  InventoryUpdateRequest,
} from "@/lib/types"

export const inventoryQueryKey = ["inventory"]

export async function getInventory() {
  const { data } = await api.get<InventoryResponse[]>("/inventories")
  return data
}

export async function createInventory(request: InventoryCreateRequest) {
  const { data } = await api.post<InventoryResponse>("/inventories", request)
  return data
}

export async function updateInventory(id: number, request: InventoryUpdateRequest) {
  const { data } = await api.put<InventoryResponse>(`/inventories/${id}`, request)
  return data
}

export async function adjustInventory(id: number, request: InventoryAdjustmentRequest) {
  const { data } = await api.patch<InventoryResponse>(`/inventories/${id}/adjust`, request)
  return data
}
