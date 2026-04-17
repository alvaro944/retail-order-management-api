import { api } from "@/lib/api/client"
import type { CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest } from "@/lib/types"

export const customerQueryKey = ["customers"] as const
export const customerDetailQueryKey = (id: number) => ["customers", "detail", id] as const

export async function getCustomers() {
  const { data } = await api.get<CustomerResponse[]>("/customers")
  return data
}

export async function getCustomerById(id: number) {
  const { data } = await api.get<CustomerResponse>(`/customers/${id}`)
  return data
}

export async function createCustomer(request: CustomerCreateRequest) {
  const { data } = await api.post<CustomerResponse>("/customers", request)
  return data
}

export async function updateCustomer(id: number, request: CustomerUpdateRequest) {
  const { data } = await api.put<CustomerResponse>(`/customers/${id}`, request)
  return data
}

export async function deleteCustomer(id: number) {
  await api.delete(`/customers/${id}`)
}
