import type { InventoryAdjustmentType } from "@/lib/types"

export function getProjectedQuantity(
  currentQuantity: number,
  type: InventoryAdjustmentType,
  quantity: number,
) {
  return type === "INCREASE"
    ? currentQuantity + quantity
    : currentQuantity - quantity
}

export function getInventoryAdjustmentFromTarget(
  currentQuantity: number,
  targetQuantity: number,
) {
  if (targetQuantity === currentQuantity) {
    return null
  }

  return targetQuantity > currentQuantity
    ? {
        type: "INCREASE" as const,
        quantity: targetQuantity - currentQuantity,
      }
    : {
        type: "DECREASE" as const,
        quantity: currentQuantity - targetQuantity,
      }
}
