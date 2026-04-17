import { AxiosError } from "axios"

import type { ProblemDetail } from "@/lib/types"

export function getProblemDetail(error: unknown): ProblemDetail | null {
  if (!(error instanceof AxiosError)) {
    return null
  }

  const data = error.response?.data
  if (data && typeof data === "object") {
    return data as ProblemDetail
  }

  return null
}

export function getProblemDetailMessage(error: unknown, fallback: string) {
  const detail = getProblemDetail(error)
  return detail?.detail ?? detail?.title ?? fallback
}

export function hasHttpStatus(error: unknown, status: number) {
  return error instanceof AxiosError && error.response?.status === status
}
