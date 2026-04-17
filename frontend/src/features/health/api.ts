import { api } from "@/lib/api/client"
import type { HealthResponse } from "@/lib/types"

export const healthQueryKey = ["health"] as const

export async function getHealth() {
  const { data } = await api.get<HealthResponse>("/health")
  return data
}
