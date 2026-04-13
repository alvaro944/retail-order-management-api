const ACCESS_TOKEN_KEY = "retail-order-management.access-token"

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
