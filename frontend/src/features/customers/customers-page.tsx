import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PencilLine, Phone, Search, Trash2, UserPlus, UsersRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { LoadingBlock } from "@/components/app/loading-block"
import { MetricCard } from "@/components/app/metric-card"
import { PageHeader } from "@/components/app/page-header"
import { SectionCard } from "@/components/app/section-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { formatDateTime, formatNumber } from "@/lib/format"
import { buildCustomerPayload } from "@/features/customers/customer-payload"
import { createCustomer, customerQueryKey, deleteCustomer, getCustomers, updateCustomer } from "@/features/customers/api"

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(120),
  email: z.string().email("A valid email is required").max(160),
  phone: z.string().max(30).optional(),
})

type FormValues = z.output<typeof schema>
type CustomerFormController = ReturnType<typeof useForm<z.input<typeof schema>, unknown, FormValues>>

function CustomerFormFields({
  form,
  firstNameId,
  lastNameId,
  emailId,
  phoneId,
}: {
  form: CustomerFormController
  firstNameId: string
  lastNameId: string
  emailId: string
  phoneId: string
}) {
  return (
    <>
      <FormField
        label="First name"
        htmlFor={firstNameId}
        hint="Use the name operators expect to identify quickly."
        error={form.formState.errors.firstName?.message}
      >
        <Input id={firstNameId} className="bg-muted" {...form.register("firstName")} />
      </FormField>
      <FormField
        label="Last name"
        htmlFor={lastNameId}
        error={form.formState.errors.lastName?.message}
      >
        <Input id={lastNameId} className="bg-muted" {...form.register("lastName")} />
      </FormField>
      <FormField
        label="Email"
        htmlFor={emailId}
        hint="Used as the primary contact field in the current frontend."
        error={form.formState.errors.email?.message}
      >
        <Input id={emailId} type="email" className="bg-muted" {...form.register("email")} />
      </FormField>
      <FormField
        label="Phone"
        htmlFor={phoneId}
        hint="Optional, but useful for faster customer support context."
        error={form.formState.errors.phone?.message}
      >
        <Input id={phoneId} className="bg-muted" {...form.register("phone")} />
      </FormField>
    </>
  )
}

function CreateCustomerSheet() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
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
      toast.success("Customer created successfully.")
      setOpen(false)
      form.reset()
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(buildCustomerPayload(values))
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Customer could not be created."))
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="ledger-primary-gradient text-primary-foreground" />}>
        <UserPlus className="size-4" />
        New customer
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border p-6">
          <SheetTitle>Create customer</SheetTitle>
          <p className="text-sm leading-7 text-muted-foreground">
            Register an active customer ready to be used in the current order flow.
          </p>
        </SheetHeader>
        <form className="space-y-5 p-6" onSubmit={submit}>
          <CustomerFormFields
            form={form}
            firstNameId="customer-first-name"
            lastNameId="customer-last-name"
            emailId="customer-email"
            phoneId="customer-phone"
          />
          <SheetFooter className="border-t border-border bg-muted/35 p-6">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving customer..." : "Save customer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function EditCustomerDialog({
  id,
  firstName,
  lastName,
  email,
  phone,
}: {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName,
      lastName,
      email,
      phone: phone ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateCustomer(id, buildCustomerPayload(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerQueryKey })
      toast.success("Customer updated successfully.")
      setOpen(false)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          form.reset({
            firstName,
            lastName,
            email,
            phone: phone ?? "",
          })
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilLine className="size-4" />
        Edit
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[1.5rem] bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>
            Update the service record for <span className="font-medium text-foreground">{firstName} {lastName}</span> without leaving the list.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5 p-6"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutation.mutateAsync(values)
            } catch (error) {
              toast.error(getProblemDetailMessage(error, "Customer could not be updated."))
            }
          })}
        >
          <CustomerFormFields
            form={form}
            firstNameId={`customer-first-name-${id}`}
            lastNameId={`customer-last-name-${id}`}
            emailId={`customer-email-${id}`}
            phoneId={`customer-phone-${id}`}
          />
          <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving changes..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeactivateCustomerDialog({
  id,
  firstName,
  lastName,
}: {
  id: number
  firstName: string
  lastName: string
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteCustomer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerQueryKey })
      toast.success("Customer removed from the active list.")
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" />}>
        <Trash2 className="size-4" />
        Remove
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[1.5rem] bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Remove active customer</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{firstName} {lastName}</span> will be hidden from active customer reads and order selection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
          <p>Use this when the customer should leave the current working base without deleting historical records.</p>
          <p>The backend handles this as a logical delete, so the active list stays clean.</p>
        </div>
        <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep customer
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await mutation.mutateAsync()
              } catch (error) {
                toast.error(getProblemDetailMessage(error, "Customer could not be removed."))
              }
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Removing..." : "Remove customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CustomersPage() {
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: customerQueryKey,
    queryFn: getCustomers,
  })

  const customers = useMemo(() => query.data ?? [], [query.data])

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return customers
    }

    return customers.filter((customer) =>
      [customer.firstName, customer.lastName, customer.email, customer.phone ?? ""].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    )
  }, [customers, search])

  const customersWithPhone = useMemo(
    () => customers.filter((customer) => Boolean(customer.phone?.trim())).length,
    [customers],
  )
  const customersWithoutPhone = customers.length - customersWithPhone

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Customer records"
        title="Customers"
        description="Keep customer records clean, searchable and ready for order creation while editing service details in place."
        meta={<span>{formatNumber(customers.length)} active customers</span>}
        actions={<CreateCustomerSheet />}
      />

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Customers could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Check the backend connection and try again.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError ? (
        <>
          <div className="ledger-reveal grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_repeat(2,minmax(0,1fr))]">
            <SectionCard variant="soft" className="space-y-4">
              <div className="space-y-2">
                <p className="ledger-kicker">Service posture</p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Search by name, email or phone to keep customer support and order intake moving, then update or retire records inline.
                </p>
              </div>
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email or phone"
                  className="bg-muted pl-10"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{formatNumber(rows.length)} visible results</span>
                {search.trim() ? (
                  <Button variant="ghost" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                ) : null}
              </div>
            </SectionCard>

            <MetricCard
              label="Reachable by phone"
              value={formatNumber(customersWithPhone)}
              detail={`${formatNumber(customersWithoutPhone)} customers still have no phone number registered.`}
              icon={<Phone className="size-4" />}
            />
            <MetricCard
              label="Operational base"
              value={formatNumber(customers.length)}
              detail="All active records can be used immediately in the order workflow."
              icon={<UsersRound className="size-4" />}
            />
          </div>

          {customers.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No customers yet"
              description="Create the first customer to unlock a smoother order creation flow with real commercial context."
              action={<CreateCustomerSheet />}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No customers match this search"
              description="Try a broader search term or clear the current filter to review the full customer base again."
              action={
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <SectionCard variant="bare" className="ledger-reveal overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="min-w-[220px]">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">Customer #{customer.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{customer.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.phone || "No phone number registered"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EditCustomerDialog
                            id={customer.id}
                            firstName={customer.firstName}
                            lastName={customer.lastName}
                            email={customer.email}
                            phone={customer.phone}
                          />
                          <DeactivateCustomerDialog
                            id={customer.id}
                            firstName={customer.firstName}
                            lastName={customer.lastName}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          )}
        </>
      ) : null}
    </section>
  )
}
