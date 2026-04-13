import { api } from "@/lib/api/client"
import type { ProductCreateRequest, ProductResponse } from "@/lib/types"

export const productQueryKey = ["products"]

export async function getProducts() {
  const { data } = await api.get<ProductResponse[]>("/products")
  return data
}

export async function createProduct(request: ProductCreateRequest) {
  const { data } = await api.post<ProductResponse>("/products", request)
  return data
}
