import { api } from "@/lib/api/client"
import type { CustomerCreateRequest, CustomerResponse } from "@/lib/types"

export const customerQueryKey = ["customers"]

export async function getCustomers() {
  const { data } = await api.get<CustomerResponse[]>("/customers")
  return data
}

export async function createCustomer(request: CustomerCreateRequest) {
  const { data } = await api.post<CustomerResponse>("/customers", request)
  return data
}
