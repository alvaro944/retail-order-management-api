import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, Building2, LockKeyhole, UserRound } from "lucide-react"
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

  async function handleSubmit(values: LoginFormValues) {
    setSubmitError(null)
    try {
      await login({
        username: values.username,
        password: values.password,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo iniciar sesión.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-[1100px] overflow-hidden rounded-[28px] bg-card/95 ledger-shadow ledger-ghost-border md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[720px] flex-col justify-between overflow-hidden bg-muted p-12 md:flex">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="ledger-primary-gradient flex size-10 items-center justify-center rounded-md text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-foreground">Retail Ledger</p>
                <p className="text-sm text-muted-foreground">Order management operations</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Sign-in gateway
              </p>
              <h1 className="max-w-lg text-5xl font-semibold leading-[1.02] text-foreground">
                Precision across products, customers, inventory, and orders.
              </h1>
              <p className="max-w-md text-base leading-7 text-muted-foreground">
                Entra en la consola operativa para trabajar con datos reales de negocio y una sesión JWT protegida desde el primer paso.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-card ledger-shadow">
              <LockKeyhole className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Bootstrap credentials ready</p>
              <p className="text-sm text-muted-foreground">
                Default backend user: <span className="font-medium text-foreground">admin / admin123</span>
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-24 right-[-12px] text-[280px] font-heading font-extrabold leading-none text-primary/6">
            RL
          </div>
        </section>

        <section className="flex items-center justify-center bg-card px-6 py-10 md:px-12">
          <Card className="w-full border-0 shadow-none">
            <CardContent className="space-y-8 p-0">
              <div className="space-y-3">
                <div className="md:hidden flex items-center gap-3">
                  <div className="ledger-primary-gradient flex size-10 items-center justify-center rounded-md text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold">Retail Ledger</p>
                    <p className="text-sm text-muted-foreground">JWT operations suite</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Secure access
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-foreground">Sign in to continue</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Usa tu cuenta de backend para entrar al frontend operativo de retail order management.
                  </p>
                </div>
              </div>

              {submitError ? (
                <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Authentication failed</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  label="Username"
                  htmlFor="username"
                  error={form.formState.errors.username?.message}
                >
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="username"
                      className="h-11 rounded-md bg-muted pl-10"
                      placeholder="admin"
                      {...form.register("username")}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Password"
                  htmlFor="password"
                  error={form.formState.errors.password?.message}
                >
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="h-11 rounded-md bg-muted pl-10"
                      placeholder="••••••••••••"
                      {...form.register("password")}
                    />
                  </div>
                </FormField>

                <div className="flex items-center gap-3 rounded-lg bg-muted/70 px-4 py-3">
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
                  className="h-11 w-full rounded-md ledger-primary-gradient text-primary-foreground"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Authorizing..." : "Authorize entry"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
