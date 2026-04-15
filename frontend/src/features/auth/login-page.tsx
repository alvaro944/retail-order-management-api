import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { Navigate } from "react-router-dom"
import { z } from "zod"

import { FormField } from "@/components/app/form-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/auth-context"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(true),
})

type LoginFormValues = z.output<typeof loginSchema>

export function LoginPage() {
  const { isAuthenticated, isInitializing, login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<z.input<typeof loginSchema>, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin123",
      remember: true,
    },
  })
  const remember = useWatch({ control: form.control, name: "remember" })

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
        <div className="ledger-panel w-full max-w-xl p-8 text-center">
          <p className="ledger-kicker">Retail Ledger</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">Restoring your session</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Checking secure credentials and loading the operational workspace.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(values: LoginFormValues) {
    setSubmitError(null)
    try {
      await login({
        username: values.username,
        password: values.password,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo iniciar sesion.")
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-3 py-3 sm:px-4 sm:py-4">
      <div className="ledger-reveal grid w-full max-w-[1220px] overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_28px_70px_-36px_rgba(23,35,46,0.26)] md:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-[oklch(0.24_0.02_225)] p-6 text-white sm:p-10 md:min-h-[760px] md:p-12">
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3">
              <div className="ledger-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold tracking-[-0.05em] text-white">Retail Ledger</p>
                <p className="text-sm text-white/56">Secured retail operations</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Sign-in gateway</p>
              <h1 className="max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-[3.55rem]">
                Open the retail workspace with the same calm you expect from the operation itself.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-white/64 sm:text-base">
                Access a workspace built for products, customers, stock and orders, with JWT authentication and immediate feedback around every action.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,1fr))]">
              <div className="border-t border-white/10 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Workspace posture</p>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  A quieter working surface built for catalog review, stock visibility and transactional order flow.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Inventory</p>
                <p className="mt-2 text-sm leading-6 text-white/78">Low-stock signals and availability checks.</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Orders</p>
                <p className="mt-2 text-sm leading-6 text-white/78">Transactional creation and controlled cancellation.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <ShieldCheck className="size-5 text-white/82" />
              </div>
              <div>
                <p className="font-medium text-white">Bootstrap credentials ready</p>
                <p className="text-sm text-white/56">
                  Demo backend user available for this environment.
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Access</p>
              <p className="text-white">admin / admin123</p>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-20 right-[-8px] text-[220px] font-heading font-bold leading-none text-white/6 sm:text-[280px]">
            RL
          </div>
        </section>

        <section className="flex items-center justify-center bg-card px-5 py-8 sm:px-8 md:px-12">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardContent className="space-y-8 p-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 md:hidden">
                  <div className="ledger-primary-gradient flex size-10 items-center justify-center rounded-xl text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold tracking-[-0.04em]">Retail Ledger</p>
                    <p className="text-sm text-muted-foreground">Operational console</p>
                  </div>
                </div>
                <div>
                  <p className="ledger-kicker">Secure access</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">Enter the workspace</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Use a valid backend account to open the operational frontend and keep working with the current API contracts.
                  </p>
                </div>
              </div>

              {submitError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Authentication failed</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  label="Username"
                  htmlFor="username"
                  hint="Use the backend bootstrap account or any valid authenticated user."
                  error={form.formState.errors.username?.message}
                >
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="username"
                      className="bg-muted pl-10"
                      placeholder="admin"
                      {...form.register("username")}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Password"
                  htmlFor="password"
                  hint="Credentials are sent to the existing JWT login endpoint."
                  error={form.formState.errors.password?.message}
                >
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="bg-muted pl-10"
                      placeholder="Enter your password"
                      {...form.register("password")}
                    />
                  </div>
                </FormField>

                <div className="flex items-center gap-3 rounded-[1rem] bg-muted/75 px-4 py-3">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => form.setValue("remember", Boolean(checked))}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Keep this session active on this device
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full ledger-primary-gradient text-primary-foreground"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Authorizing access..." : "Open workspace"}
                  <ArrowRight className="size-4" />
                </Button>

                <div className="rounded-[1rem] border border-border/80 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <LockKeyhole className="size-4 text-primary" />
                    Session persistence is stored only on this device when you keep the session active.
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
