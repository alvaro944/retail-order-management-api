import { describe, expect, it } from "vitest"

import { buildProductPayload } from "@/features/products/product-payload"

describe("buildProductPayload", () => {
  it("trims the optional description and omits it when empty", () => {
    expect(
      buildProductPayload({
        name: "Desk Lamp",
        sku: "DL-100",
        price: 39.99,
        description: "   ",
      }),
    ).toEqual({
      name: "Desk Lamp",
      sku: "DL-100",
      price: 39.99,
      description: undefined,
    })
  })

  it("preserves a meaningful description", () => {
    expect(
      buildProductPayload({
        name: "Desk Lamp",
        sku: "DL-100",
        price: 39.99,
        description: "  Warm light with matte finish  ",
      }),
    ).toEqual({
      name: "Desk Lamp",
      sku: "DL-100",
      price: 39.99,
      description: "Warm light with matte finish",
    })
  })
})
