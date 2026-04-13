import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { AxiosError } from "axios"

import { api, configureAccessTokenGetter } from "@/lib/api/client"
import { getProblemDetailMessage } from "@/lib/api/problem-detail"
import type {
  AuthLoginRequest,
  AuthTokenResponse,
  AuthenticatedUserResponse,
} from "@/lib/types"
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/features/auth/storage"

type AuthContextValue = {
  accessToken: string | null
  currentUser: AuthenticatedUserResponse | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (credentials: AuthLoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchCurrentUser() {
  const { data } = await api.get<AuthenticatedUserResponse>("/auth/me")
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken())
  const [currentUser, setCurrentUser] = useState<AuthenticatedUserResponse | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    configureAccessTokenGetter(() => accessToken)
  }, [accessToken])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      if (!accessToken) {
        if (mounted) {
          setCurrentUser(null)
          setIsInitializing(false)
        }
        return
      }

      try {
        const user = await fetchCurrentUser()
        if (mounted) {
          setCurrentUser(user)
        }
      } catch {
        if (mounted) {
          clearStoredAccessToken()
          setAccessToken(null)
          setCurrentUser(null)
        }
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [accessToken])

  async function login(credentials: AuthLoginRequest) {
    try {
      const { data } = await api.post<AuthTokenResponse>("/auth/login", credentials)
      setStoredAccessToken(data.accessToken)
      setAccessToken(data.accessToken)
      const user = await fetchCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(getProblemDetailMessage(error, "No se pudo iniciar sesión."))
      }

      throw error
    }
  }

  function logout() {
    clearStoredAccessToken()
    setAccessToken(null)
    setCurrentUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      currentUser,
      isAuthenticated: Boolean(accessToken && currentUser),
      isInitializing,
      login,
      logout,
    }),
    [accessToken, currentUser, isInitializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return value
}
