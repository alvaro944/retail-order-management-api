import { AxiosError } from "axios"
import { describe, expect, it } from "vitest"

import { getProblemDetail, getProblemDetailMessage } from "@/lib/api/problem-detail"

describe("problem detail helpers", () => {
  it("extracts problem detail payloads from axios errors", () => {
    const error = new AxiosError(
      "Request failed",
      "400",
      undefined,
      undefined,
      {
        data: {
          title: "Bad Request",
          detail: "name is required",
          status: 400,
        },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      },
    )

    expect(getProblemDetail(error)).toEqual({
      title: "Bad Request",
      detail: "name is required",
      status: 400,
    })
    expect(getProblemDetailMessage(error, "Fallback")).toBe("name is required")
  })

  it("returns the fallback message for non-axios errors", () => {
    expect(getProblemDetailMessage(new Error("boom"), "Fallback")).toBe("Fallback")
  })
})
