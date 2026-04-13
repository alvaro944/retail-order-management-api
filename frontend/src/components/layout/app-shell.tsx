import { Box, ClipboardList, LogOut, Package2, UsersRound, Warehouse } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

const navigation = [
  { to: "/products", label: "Products", icon: Package2 },
  { to: "/customers", label: "Customers", icon: UsersRound },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/orders", label: "Orders", icon: ClipboardList },
]

export function AppShell() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1560px] gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="ledger-surface flex flex-col justify-between rounded-[28px] p-5 ledger-shadow ledger-ghost-border">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="ledger-primary-gradient flex size-11 items-center justify-center rounded-md text-primary-foreground">
                  <Box className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold">Retail Ledger</p>
                  <p className="text-sm text-muted-foreground">JWT operations suite</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Opera productos, clientes, inventario y pedidos con una capa visual sobria y directa.
              </p>
            </div>

            <nav className="space-y-2">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/70 hover:text-foreground",
                    )
                  }
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4 rounded-2xl bg-card/80 p-4 ledger-ghost-border">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Active session
              </p>
              <p className="mt-2 font-heading text-lg font-semibold text-foreground">
                {currentUser?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUser?.roles.join(", ") || "Authenticated user"}
              </p>
            </div>
            <Button variant="outline" className="w-full justify-between" onClick={logout}>
              Close session
              <LogOut className="size-4" />
            </Button>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="ledger-surface flex items-center justify-between rounded-[28px] px-6 py-5 ledger-shadow ledger-ghost-border">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Phase 11 Stitch
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Retail order management frontend</h2>
            </div>
            <div className="hidden items-center gap-3 text-sm text-muted-foreground md:flex">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Connected to JWT-protected backend
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
