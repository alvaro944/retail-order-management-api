import { describe, expect, it } from "vitest"

import { getInventoryAdjustmentFromTarget } from "@/features/inventory/inventory-utils"

describe("getInventoryAdjustmentFromTarget", () => {
  it("returns an increase adjustment when the target is higher than the current quantity", () => {
    expect(getInventoryAdjustmentFromTarget(12, 17)).toEqual({
      type: "INCREASE",
      quantity: 5,
    })
  })

  it("returns a decrease adjustment when the target is lower than the current quantity", () => {
    expect(getInventoryAdjustmentFromTarget(12, 7)).toEqual({
      type: "DECREASE",
      quantity: 5,
    })
  })

  it("returns null when the target quantity is unchanged", () => {
    expect(getInventoryAdjustmentFromTarget(12, 12)).toBeNull()
  })
})
