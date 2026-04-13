import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, RotateCcw, ShoppingCart } from "lucide-react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { LoadingBlock } from "@/components/app/loading-block"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProblemDetailMessage } from "@/lib/api/problem-detail"
import { formatDateTime, formatMoney } from "@/lib/format"
import { customerQueryKey, getCustomers } from "@/features/customers/api"
import { inventoryQueryKey } from "@/features/inventory/api"
import { cancelOrder, createOrder, getOrders, orderQueryKey } from "@/features/orders/api"
import { getProducts, productQueryKey } from "@/features/products/api"

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().min(1, "Quantity must be greater than zero"),
      }),
    )
    .min(1, "At least one order line is required"),
})

type FormValues = z.output<typeof schema>

function CreateOrderDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const customersQuery = useQuery({ queryKey: customerQueryKey, queryFn: getCustomers })
  const productsQuery = useQuery({ queryKey: productQueryKey, queryFn: getProducts })

  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const selectedCustomerId = useWatch({ control: form.control, name: "customerId" })
  const watchedItems = useWatch({ control: form.control, name: "items" })

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKey }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKey }),
      ])
      toast.success("Order created")
      setOpen(false)
      form.reset({
        customerId: "",
        items: [{ productId: "", quantity: 1 }],
      })
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        customerId: Number(values.customerId),
        items: values.items.map((item) => ({
          productId: Number(item.productId),
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Order could not be created."))
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-10 rounded-md ledger-primary-gradient text-primary-foreground" />}>
        <Plus className="size-4" />
        Create order
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-2xl bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Selecciona un cliente y una o más líneas de producto. La API validará stock, productos activos y duplicados.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 p-6" onSubmit={submit}>
          <FormField label="Customer" htmlFor="order-customer" error={form.formState.errors.customerId?.message}>
            <Select value={selectedCustomerId} onValueChange={(value) => form.setValue("customerId", value ?? "")}>
              <SelectTrigger id="order-customer" className="h-11 w-full bg-muted">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {(customersQuery.data ?? []).map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.firstName} {customer.lastName} · {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Order lines
              </p>
              <Button type="button" variant="outline" onClick={() => append({ productId: "", quantity: 1 })}>
                <Plus className="size-4" />
                Add line
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-xl bg-muted/60 p-4 ledger-ghost-border md:grid-cols-[1fr_180px_auto]">
                <FormField
                  label={`Product ${index + 1}`}
                  htmlFor={`order-item-${index}`}
                  error={form.formState.errors.items?.[index]?.productId?.message}
                >
                  <Select
                    value={watchedItems?.[index]?.productId ?? ""}
                    onValueChange={(value) => form.setValue(`items.${index}.productId`, value ?? "")}
                  >
                    <SelectTrigger id={`order-item-${index}`} className="h-11 w-full bg-card">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(productsQuery.data ?? []).map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name} · {product.sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Quantity"
                  htmlFor={`order-quantity-${index}`}
                  error={form.formState.errors.items?.[index]?.quantity?.message}
                >
                  <Input
                    id={`order-quantity-${index}`}
                    type="number"
                    className="h-11 bg-card"
                    {...form.register(`items.${index}.quantity`)}
                  />
                </FormField>

                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => remove(index)} disabled={fields.length === 1}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="border-t border-border bg-muted/40">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CancelOrderDialog({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKey }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKey }),
      ])
      toast.success("Order cancelled")
    },
  })

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <RotateCcw className="size-4" />
        Cancel
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Cancel order #{orderId}</DialogTitle>
          <DialogDescription>
            Esta acción restaurará el inventario dentro de la misma transacción si el pedido sigue en estado CREATED.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-border bg-muted/40">
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() =>
              mutation
                .mutateAsync()
                .catch((error) => toast.error(getProblemDetailMessage(error, "Order could not be cancelled.")))
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OrdersPage() {
  const query = useQuery({
    queryKey: orderQueryKey,
    queryFn: getOrders,
  })

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Order flow"
        title="Orders"
        description="Crea pedidos transaccionales, consulta su estado y cancela pedidos válidos restaurando inventario cuando corresponda."
        actions={<CreateOrderDialog />}
      />

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
          <AlertTitle>Orders could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Retry after checking the backend connection.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError && (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Create the first order to validate the full transactional flow across customers, products, and inventory."
        />
      ) : null}

      {!query.isLoading && !query.isError && (query.data?.length ?? 0) > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-card ledger-shadow ledger-ghost-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatMoney(order.totalAmount)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.items.length}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {order.status === "CREATED" ? <CancelOrderDialog orderId={order.id} /> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  )
}
