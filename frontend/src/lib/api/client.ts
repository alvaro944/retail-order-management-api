import axios from "axios"

let accessTokenGetter: (() => string | null) | null = null

export function configureAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const accessToken = accessTokenGetter?.()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
