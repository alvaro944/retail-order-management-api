import { Navigate, Outlet, useLocation } from "react-router-dom"

import { LoadingBlock } from "@/components/app/loading-block"
import { useAuth } from "@/features/auth/auth-context"

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <LoadingBlock />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
