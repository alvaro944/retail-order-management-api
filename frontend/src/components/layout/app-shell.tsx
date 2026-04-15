import { Box, ClipboardList, Dot, LogOut, Package2, ShieldCheck, UsersRound, Warehouse } from "lucide-react"
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
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1520px] flex-col gap-4 px-3 py-3 sm:px-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        <aside className="ledger-reveal flex flex-col justify-between gap-7 rounded-[1.9rem] border border-white/8 bg-[oklch(0.24_0.02_225)] px-4 py-5 text-[oklch(0.95_0.004_220)] shadow-[0_30px_70px_-35px_rgba(16,25,36,0.7)] sm:px-5 lg:min-h-[calc(100dvh-2.5rem)]">
          <div className="space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="ledger-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-[0_14px_24px_-16px_rgba(48,63,80,0.72)]">
                  <Box className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold tracking-[-0.045em] text-white">Retail Ledger</p>
                  <p className="text-sm text-white/58">Operational frontend</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Workspace</p>
                <p className="max-w-[28ch] text-sm leading-7 text-white/72">
                  Products, customers, stock and orders aligned in one calm, transaction-ready surface.
                </p>
                <div className="flex items-center gap-2 text-sm text-white/82">
                  <ShieldCheck className="size-4 text-white/72" />
                  JWT-protected backend connection
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Active session</p>
              <p className="mt-2 font-heading text-xl font-semibold tracking-[-0.04em] text-white">
                {currentUser?.username ?? "Authenticated user"}
              </p>
              <p className="mt-1 text-sm text-white/58">{currentUser?.roles.join(", ") || "Authenticated user"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/58">
              <Dot className="size-5 text-white/68" />
              Session ready for secured operations
            </div>
            <Button variant="outline" className="w-full justify-between border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" onClick={logout}>
              Close session
              <LogOut className="size-4" />
            </Button>
          </div>
        </aside>

        <main className="space-y-4 lg:space-y-6">
          <header className="ledger-panel-bare ledger-reveal-delayed px-0 py-3">
            <div className="grid gap-5 px-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-end">
              <div className="space-y-3 px-4 sm:px-5 lg:px-0">
                <p className="ledger-kicker">Phase 11 Stitch</p>
                <div className="space-y-2">
                  <h2 className="text-[2rem] font-semibold leading-[0.96] tracking-[-0.07em] text-foreground sm:text-[2.9rem]">
                    Retail operations frontend
                  </h2>
                  <p className="max-w-[72ch] text-sm leading-7 text-muted-foreground">
                    A quieter, more product-specific control surface for the current retail backend, focused on readable operations and cleaner decision flow.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-5 lg:px-0">
                <div className="border-t border-border/80 pt-3">
                  <p className="ledger-kicker">Environment</p>
                  <p className="mt-2 text-base leading-6 text-foreground">Protected retail API online.</p>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <p className="ledger-kicker">Scope</p>
                  <p className="mt-2 text-base leading-6 text-foreground">Four operational modules in one workspace.</p>
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
