import { api } from "@/lib/api/client"
import type { InventoryCreateRequest, InventoryResponse } from "@/lib/types"

export const inventoryQueryKey = ["inventory"]

export async function getInventory() {
  const { data } = await api.get<InventoryResponse[]>("/inventories")
  return data
}

export async function createInventory(request: InventoryCreateRequest) {
  const { data } = await api.post<InventoryResponse>("/inventories", request)
  return data
}
