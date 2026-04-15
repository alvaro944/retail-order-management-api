import { describe, expect, it } from "vitest"

import { buildCustomerPayload } from "@/features/customers/customer-payload"

describe("buildCustomerPayload", () => {
  it("trims the optional phone and omits it when empty", () => {
    expect(
      buildCustomerPayload({
        firstName: "Ana",
        lastName: "Garcia",
        email: "ana@example.com",
        phone: "   ",
      }),
    ).toEqual({
      firstName: "Ana",
      lastName: "Garcia",
      email: "ana@example.com",
      phone: undefined,
    })
  })

  it("preserves a meaningful phone number", () => {
    expect(
      buildCustomerPayload({
        firstName: "Ana",
        lastName: "Garcia",
        email: "ana@example.com",
        phone: "  +34 600 000 001  ",
      }),
    ).toEqual({
      firstName: "Ana",
      lastName: "Garcia",
      email: "ana@example.com",
      phone: "+34 600 000 001",
    })
  })
})
