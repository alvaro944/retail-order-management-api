import type { ProductCreateRequest } from "@/lib/types"

type ProductPayloadInput = {
  name: string
  sku: string
  price: number
  description?: string
}

export function buildProductPayload(values: ProductPayloadInput): ProductCreateRequest {
  const description = values.description?.trim()

  return {
    name: values.name,
    sku: values.sku,
    price: values.price,
    description: description ? description : undefined,
  }
}
