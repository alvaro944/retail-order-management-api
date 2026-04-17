import { useQuery } from "@tanstack/react-query"
import { Box, ClipboardList, Dot, LogOut, Package2, UsersRound, Warehouse } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"
import { getHealth, healthQueryKey } from "@/features/health/api"

const navigation = [
  { to: "/products", label: "Products", icon: Package2 },
  { to: "/customers", label: "Customers", icon: UsersRound },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/orders", label: "Orders", icon: ClipboardList },
]

export function AppShell() {
  const { currentUser, logout } = useAuth()
  const username = currentUser?.username ?? "admin"
  const roles = currentUser?.roles.join(", ") ?? "Admin"
  const healthQuery = useQuery({
    queryKey: healthQueryKey,
    queryFn: getHealth,
    refetchOnWindowFocus: true,
  })
  const isApiOnline = healthQuery.data?.status === "UP"

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1520px] flex-col gap-4 px-3 py-3 sm:px-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        <aside className="ledger-reveal flex flex-col justify-between gap-7 rounded-[1.9rem] border border-white/8 bg-[oklch(0.24_0.02_225)] px-4 py-5 text-[oklch(0.95_0.004_220)] shadow-[0_30px_70px_-35px_rgba(16,25,36,0.7)] sm:px-5 lg:min-h-[calc(100dvh-2.5rem)]">
          <div className="space-y-7">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="ledger-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-[0_14px_24px_-16px_rgba(48,63,80,0.72)]">
                  <Box className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold tracking-[-0.045em] text-white">Retail Ledger</p>
                  <p className="text-sm text-white/58">Operational frontend / portfolio demo</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Workspace</p>
                <p className="max-w-[28ch] text-sm leading-6 text-white/72">
                  Spring Boot retail admin demo for products, customers, stock and orders.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-white/58">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      healthQuery.isError ? "bg-amber-300/80" : isApiOnline ? "bg-emerald-300/85" : "bg-white/28",
                    )}
                  />
                  <span>
                    {healthQuery.isError ? "API unavailable" : isApiOnline ? "API online" : "Checking API"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex min-w-fit items-center justify-between gap-4 rounded-[1.1rem] border border-transparent px-3.5 py-3 text-sm font-medium text-white/58 transition-[background-color,border-color,color,transform] duration-200",
                      isActive
                        ? "border-white/10 bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                        : "hover:border-white/8 hover:bg-white/[0.035] hover:text-white/90",
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </div>
                  <Dot className={cn("size-4", "text-white/22")} />
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Presentation</p>
              <p className="mt-2 font-heading text-xl font-semibold tracking-[-0.04em] text-white">Alvaro Cervantes</p>
              <p className="mt-1 text-sm text-white/58">Junior Developer / backend and frontend demo</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-3.5 py-3">
              <p className="text-sm text-white/78">{username}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">{roles}</p>
            </div>
            <Button variant="outline" className="w-full justify-between border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" onClick={logout}>
              Sign out
              <LogOut className="size-4" />
            </Button>
          </div>
        </aside>

        <main className="space-y-4 lg:space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
