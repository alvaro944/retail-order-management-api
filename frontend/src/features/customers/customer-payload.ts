import type { CustomerCreateRequest } from "@/lib/types"

type CustomerPayloadInput = {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export function buildCustomerPayload(values: CustomerPayloadInput): CustomerCreateRequest {
  const phone = values.phone?.trim()

  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: phone ? phone : undefined,
  }
}
