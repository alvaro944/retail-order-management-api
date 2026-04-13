import { beforeEach, describe, expect, it } from "vitest"

import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/features/auth/storage"

describe("auth storage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("stores and reads the access token", () => {
    setStoredAccessToken("jwt-token")

    expect(getStoredAccessToken()).toBe("jwt-token")
  })

  it("clears the stored access token", () => {
    setStoredAccessToken("jwt-token")

    clearStoredAccessToken()

    expect(getStoredAccessToken()).toBeNull()
  })
})
