import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { LoadingBlock } from "@/components/app/loading-block"
import { PageHeader } from "@/components/app/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProblemDetailMessage } from "@/lib/api/problem-detail"
import { formatDateTime } from "@/lib/format"
import { createCustomer, customerQueryKey, getCustomers } from "@/features/customers/api"

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(120),
  email: z.string().email("A valid email is required").max(160),
  phone: z.string().max(30).optional(),
})

type FormValues = z.infer<typeof schema>

function CreateCustomerSheet() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  })

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerQueryKey })
      toast.success("Customer created")
      setOpen(false)
      form.reset()
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Customer could not be created."))
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="h-10 rounded-md ledger-primary-gradient text-primary-foreground" />}>
        <UserPlus className="size-4" />
        Create customer
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border">
          <SheetTitle>Create customer</SheetTitle>
          <p className="text-sm text-muted-foreground">Registra un nuevo cliente activo para pedidos y gestión comercial.</p>
        </SheetHeader>
        <form className="space-y-5 p-4" onSubmit={submit}>
          <FormField label="First name" htmlFor="customer-first-name" error={form.formState.errors.firstName?.message}>
            <Input id="customer-first-name" className="h-11 bg-muted" {...form.register("firstName")} />
          </FormField>
          <FormField label="Last name" htmlFor="customer-last-name" error={form.formState.errors.lastName?.message}>
            <Input id="customer-last-name" className="h-11 bg-muted" {...form.register("lastName")} />
          </FormField>
          <FormField label="Email" htmlFor="customer-email" error={form.formState.errors.email?.message}>
            <Input id="customer-email" type="email" className="h-11 bg-muted" {...form.register("email")} />
          </FormField>
          <FormField label="Phone" htmlFor="customer-phone" error={form.formState.errors.phone?.message}>
            <Input id="customer-phone" className="h-11 bg-muted" {...form.register("phone")} />
          </FormField>
          <SheetFooter className="border-t border-border bg-muted/40">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save customer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function CustomersPage() {
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: customerQueryKey,
    queryFn: getCustomers,
  })

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return query.data ?? []
    }

    return (query.data ?? []).filter((customer) =>
      [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone ?? "",
      ].some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [query.data, search])

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Customer records"
        title="Customers"
        description="Gestiona clientes activos, revisa sus datos de contacto y prepara el contexto necesario para la creación de pedidos."
        actions={<CreateCustomerSheet />}
      />

      <div className="rounded-2xl bg-card p-5 ledger-shadow ledger-ghost-border">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone"
            className="h-11 bg-muted pl-10"
          />
        </div>
      </div>

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
          <AlertTitle>Customers could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Retry after checking the backend connection.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No customers yet"
          description="Create your first customer to unlock the order creation flow and populate the operational workspace."
        />
      ) : null}

      {!query.isLoading && !query.isError && rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-card ledger-shadow ledger-ghost-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone || "No phone"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(customer.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  )
}
