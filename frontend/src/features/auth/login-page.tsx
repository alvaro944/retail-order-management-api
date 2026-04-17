import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  LoaderCircle,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/auth-context"
import { getHealth, healthQueryKey } from "@/features/health/api"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(true),
})

type LoginFormValues = z.output<typeof loginSchema>

export function LoginPage() {
  const { isAuthenticated, isInitializing, login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const healthQuery = useQuery({
    queryKey: healthQueryKey,
    queryFn: getHealth,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data?.status === "UP" ? false : 10000),
  })

  const form = useForm<z.input<typeof loginSchema>, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin123",
      remember: true,
    },
  })
  const remember = useWatch({ control: form.control, name: "remember" })
  const isApiReady = healthQuery.data?.status === "UP"
  const showConnectingState = healthQuery.isLoading || healthQuery.isError || !isApiReady

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
        <div className="ledger-panel w-full max-w-xl p-8 text-center">
          <p className="ledger-kicker">Retail Ledger</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">Restoring your session</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Loading your dashboard.</p>
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
                <p className="text-sm text-white/56">Operational frontend / portfolio demo</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Workspace</p>
              <h1 className="max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-[3.55rem]">
                Retail operations frontend for a Spring Boot portfolio project.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-white/64 sm:text-base">
                Sign in with the demo account to review products, customers, inventory and orders with seeded data and real API responses.
              </p>
            </div>

            <div
              className={cn(
                "max-w-xl rounded-[1.4rem] border px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
                isApiReady
                  ? "border-emerald-300/20 bg-emerald-400/10"
                  : "border-amber-300/16 bg-amber-300/10",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-1 flex size-9 items-center justify-center rounded-full",
                    isApiReady ? "bg-emerald-300/16 text-emerald-200" : "bg-amber-200/12 text-amber-100",
                  )}
                >
                  {showConnectingState ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {isApiReady ? "API online" : "Server is still connecting"}
                  </p>
                  <p className="max-w-lg text-sm leading-6 text-white/68">
                    {isApiReady
                      ? "The backend is ready and you can sign in now."
                      : "If this is a fresh deployment, wait a moment. The backend can take a little while to become available."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <ShieldCheck className="size-5 text-white/82" />
              </div>
              <div>
                <p className="font-medium text-white">Demo access</p>
                <p className="text-sm text-white/56">Use the seeded account to explore the app.</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Credentials</p>
              <p className="text-white">admin / admin123</p>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-20 right-[-8px] text-[220px] font-heading font-bold leading-none text-white/6 sm:text-[280px]">
            RL
          </div>
        </section>

        <section className="flex items-center justify-center bg-card px-5 py-8 sm:px-8 md:px-12 lg:px-14">
          <div className="w-full max-w-[32rem] rounded-[1.8rem] border border-border/75 bg-background/70 p-6 shadow-[0_20px_50px_-36px_rgba(23,35,46,0.2)] sm:p-8 md:p-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3 md:hidden">
                  <div className="ledger-primary-gradient flex size-10 items-center justify-center rounded-xl text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold tracking-[-0.04em]">Retail Ledger</p>
                    <p className="text-sm text-muted-foreground">Operational frontend</p>
                  </div>
                </div>
                <div>
                  <p className="ledger-kicker">Sign in</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">Enter the workspace</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">Use the demo account or any valid backend user for this portfolio project.</p>
                </div>
              </div>

              {submitError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Authentication failed</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              {showConnectingState ? (
                <Alert>
                  <LoaderCircle className="size-4 animate-spin" />
                  <AlertTitle>Backend starting up</AlertTitle>
                  <AlertDescription>
                    The login will be available as soon as the server finishes connecting. Try again in a moment.
                  </AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField label="Username" htmlFor="username" error={form.formState.errors.username?.message}>
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

                <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
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
                  disabled={form.formState.isSubmitting || showConnectingState}
                >
                  {form.formState.isSubmitting
                    ? "Authorizing access..."
                    : showConnectingState
                      ? "Waiting for server..."
                      : "Open workspace"}
                  <ArrowRight className="size-4" />
                </Button>

                <div className="rounded-[1rem] border border-border/80 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <LockKeyhole className="size-4 text-primary" />
                    The session is only kept on this device when you enable it.
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
