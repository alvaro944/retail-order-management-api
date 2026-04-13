import { api } from "@/lib/api/client"
import type { OrderCreateRequest, OrderResponse } from "@/lib/types"

export const orderQueryKey = ["orders"]

export async function getOrders() {
  const { data } = await api.get<OrderResponse[]>("/orders")
  return data
}

export async function createOrder(request: OrderCreateRequest) {
  const { data } = await api.post<OrderResponse>("/orders", request)
  return data
}

export async function cancelOrder(orderId: number) {
  const { data } = await api.post<OrderResponse>(`/orders/${orderId}/cancel`)
  return data
}
