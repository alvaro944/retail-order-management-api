export type ProblemDetail = {
  title?: string
  detail?: string
  status?: number
  path?: string
  [key: string]: unknown
}

export type AuthLoginRequest = {
  username: string
  password: string
}

export type AuthTokenResponse = {
  accessToken: string
  tokenType: string
  expiresAt: string
}

export type AuthenticatedUserResponse = {
  username: string
  roles: string[]
}

export type HealthResponse = {
  status: string
  service: string
  timestamp: string
}

export type ProductResponse = {
  id: number
  name: string
  description: string | null
  price: number
  sku: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ProductCreateRequest = {
  name: string
  description?: string
  price: number
  sku: string
}

export type ProductUpdateRequest = ProductCreateRequest

export type CustomerResponse = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CustomerCreateRequest = {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export type CustomerUpdateRequest = CustomerCreateRequest

export type InventoryProductSummary = {
  id: number
  name: string
  sku: string
}

export type InventoryResponse = {
  id: number
  product: InventoryProductSummary
  quantityAvailable: number
  minimumStock: number | null
  createdAt: string
  updatedAt: string
}

export type InventoryCreateRequest = {
  productId: number
  quantityAvailable: number
  minimumStock?: number
}

export type InventoryUpdateRequest = {
  minimumStock: number
}

export type InventoryAdjustmentType = "INCREASE" | "DECREASE"

export type InventoryAdjustmentRequest = {
  type: InventoryAdjustmentType
  quantity: number
}

export type OrderCustomerSummary = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export type OrderItemRequest = {
  productId: number
  quantity: number
}

export type OrderItemResponse = {
  id: number
  productId: number
  productName: string
  productSku: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type OrderResponse = {
  id: number
  customer: OrderCustomerSummary
  status: "CREATED" | "CANCELLED" | string
  totalAmount: number
  items: OrderItemResponse[]
  createdAt: string
  updatedAt: string
}

export type OrderCreateRequest = {
  customerId: number
  items: OrderItemRequest[]
}
