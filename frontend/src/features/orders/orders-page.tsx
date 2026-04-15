import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, RotateCcw, Search, ShoppingCart, UserRound } from "lucide-react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { LoadingBlock } from "@/components/app/loading-block"
import { MetricCard } from "@/components/app/metric-card"
import { PageHeader } from "@/components/app/page-header"
import { SectionCard } from "@/components/app/section-card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getProblemDetailMessage } from "@/lib/api/problem-detail"
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format"
import { customerQueryKey, getCustomers } from "@/features/customers/api"
import { getInventory, inventoryQueryKey } from "@/features/inventory/api"
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
  const inventoryQuery = useQuery({ queryKey: inventoryQueryKey, queryFn: getInventory })

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
  const watchedItemsValue = useWatch({ control: form.control, name: "items" })
  const watchedItems = useMemo(() => watchedItemsValue ?? [], [watchedItemsValue])

  const customerMap = useMemo(
    () => new Map((customersQuery.data ?? []).map((customer) => [String(customer.id), customer])),
    [customersQuery.data],
  )
  const productMap = useMemo(
    () => new Map((productsQuery.data ?? []).map((product) => [String(product.id), product])),
    [productsQuery.data],
  )
  const inventoryByProductId = useMemo(
    () => new Map((inventoryQuery.data ?? []).map((inventory) => [String(inventory.product.id), inventory])),
    [inventoryQuery.data],
  )

  const selectedCustomer = selectedCustomerId ? customerMap.get(selectedCustomerId) : undefined

  const duplicateProductIds = useMemo(() => {
    const counts = new Map<string, number>()

    watchedItems.forEach((item) => {
      if (!item?.productId) {
        return
      }
      counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1)
    })

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([productId]) => productId),
    )
  }, [watchedItems])

  const lines = useMemo(
    () =>
      watchedItems.map((item) => {
        const product = productMap.get(item?.productId ?? "")
        const inventory = inventoryByProductId.get(item?.productId ?? "")
        const quantity = Number(item?.quantity) || 0
        const subtotal = product ? product.price * quantity : 0
        const available = inventory?.quantityAvailable ?? null

        return {
          product,
          inventory,
          quantity,
          subtotal,
          available,
          isDuplicate: duplicateProductIds.has(item?.productId ?? ""),
          isOverStock: available !== null && quantity > available,
        }
      }),
    [duplicateProductIds, inventoryByProductId, productMap, watchedItems],
  )

  const summary = useMemo(
    () =>
      lines.reduce(
        (acc, line) => ({
          lineCount: acc.lineCount + (line.product ? 1 : 0),
          quantity: acc.quantity + line.quantity,
          total: acc.total + line.subtotal,
        }),
        { lineCount: 0, quantity: 0, total: 0 },
      ),
    [lines],
  )

  const orderWarnings = useMemo(() => {
    const warnings: string[] = []

    if (!selectedCustomer) {
      warnings.push("Select a customer.")
    }
    if (duplicateProductIds.size > 0) {
      warnings.push("Each product can appear only once.")
    }
    if (lines.some((line) => line.product && line.available === null)) {
      warnings.push("Some selected products have no inventory.")
    }
    if (lines.some((line) => line.isOverStock)) {
      warnings.push("Some quantities are higher than available stock.")
    }

    return warnings
  }, [duplicateProductIds.size, lines, selectedCustomer])

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKey }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKey }),
      ])
      toast.success("Order created successfully.")
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          form.reset({
            customerId: "",
            items: [{ productId: "", quantity: 1 }],
          })
        }
      }}
    >
      <DialogTrigger render={<Button className="ledger-primary-gradient text-primary-foreground" />}>
        <Plus className="size-4" />
        New order
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto rounded-[1.75rem] bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>Choose a customer, add lines and confirm the total.</DialogDescription>
        </DialogHeader>

        <form className="space-y-6 p-6" onSubmit={submit}>
          <FormField
            label="Customer"
            htmlFor="order-customer"
            hint="Active customers only."
            error={form.formState.errors.customerId?.message}
          >
            <Select value={selectedCustomerId} onValueChange={(value) => form.setValue("customerId", value ?? "")}>
              <SelectTrigger id="order-customer" className="w-full bg-muted">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {(customersQuery.data ?? []).map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.firstName} {customer.lastName} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="rounded-2xl border border-border/75 bg-muted/30 px-4 py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Customer:{" "}
                <span className="font-medium text-foreground">
                  {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "Not selected"}
                </span>
              </span>
              <span className="text-muted-foreground">
                Lines: <span className="font-medium text-foreground">{formatNumber(summary.lineCount)}</span>
              </span>
              <span className="text-muted-foreground">
                Units: <span className="font-medium text-foreground">{formatNumber(summary.quantity)}</span>
              </span>
              <span className="text-muted-foreground">
                Total: <span className="font-medium text-foreground">{formatMoney(summary.total)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="ledger-kicker">Lines</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Add products and quantities.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => append({ productId: "", quantity: 1 })}>
                <Plus className="size-4" />
                Add line
              </Button>
            </div>

            {fields.map((field, index) => {
              const line = lines[index]
              const selectedProduct = line?.product

              return (
                <div key={field.id} className="ledger-panel-soft space-y-4 p-4">
                  <div className="space-y-4">
                    <FormField
                      className="min-w-0"
                      label={`Product ${index + 1}`}
                      htmlFor={`order-item-${index}`}
                      hint={selectedProduct ? `${selectedProduct.sku} - ${formatMoney(selectedProduct.price)}` : "Choose a product."}
                      error={
                        form.formState.errors.items?.[index]?.productId?.message ||
                        (line?.isDuplicate ? "Each product can appear only once." : undefined)
                      }
                    >
                      <Select
                        value={watchedItems[index]?.productId ?? ""}
                        onValueChange={(value) => form.setValue(`items.${index}.productId`, value ?? "")}
                      >
                        <SelectTrigger id={`order-item-${index}`} className="w-full bg-background">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(productsQuery.data ?? []).map((product) => (
                            <SelectItem key={product.id} value={String(product.id)}>
                              {product.name} - {product.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      className="min-w-0"
                      label="Qty"
                      htmlFor={`order-quantity-${index}`}
                      hint={selectedProduct ? `Subtotal ${formatMoney(selectedProduct.price * (line?.quantity ?? 0))}` : "Positive values only."}
                      error={form.formState.errors.items?.[index]?.quantity?.message}
                    >
                      <Input
                        id={`order-quantity-${index}`}
                        type="number"
                        className="bg-background"
                        {...form.register(`items.${index}.quantity`)}
                      />
                    </FormField>

                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" onClick={() => remove(index)} disabled={fields.length === 1}>
                        Remove
                      </Button>
                    </div>
                  </div>

                  {selectedProduct ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Available {line.available === null ? "No inventory" : formatNumber(line.available)}
                      </span>
                      <span>Subtotal {formatMoney(line.subtotal)}</span>
                    </div>
                  ) : null}

                  {line?.isOverStock ? (
                    <Alert variant="destructive">
                      <AlertTitle>Insufficient stock</AlertTitle>
                      <AlertDescription>
                        Available units: {formatNumber(line.available ?? 0)}.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )
            })}
          </div>

          {orderWarnings.length > 0 ? (
            <Alert variant="destructive">
              <AlertTitle>Check the order</AlertTitle>
              <AlertDescription>{orderWarnings.join(" ")}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating order..." : "Create order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CancelOrderDialog({
  orderId,
  customerName,
  totalAmount,
  itemCount,
}: {
  orderId: number
  customerName: string
  totalAmount: number
  itemCount: number
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKey }),
        queryClient.invalidateQueries({ queryKey: inventoryQueryKey }),
      ])
      toast.success("Order cancelled successfully.")
    },
  })

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <RotateCcw className="size-4" />
        Cancel
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[1.5rem] bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Cancel order #{orderId}</DialogTitle>
          <DialogDescription>
            This order for <span className="font-medium text-foreground">{customerName}</span> will restore inventory for {formatNumber(itemCount)} line(s).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Total amount recorded: <span className="font-medium text-foreground">{formatMoney(totalAmount)}</span>
          </p>
          <p>Use this only when the order should be reversed while preserving its history.</p>
        </div>
        <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
          <Button
            variant="destructive"
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
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CREATED" | "CANCELLED">("ALL")
  const query = useQuery({
    queryKey: orderQueryKey,
    queryFn: getOrders,
  })

  const orders = useMemo(() => query.data ?? [], [query.data])

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch =
        !normalized ||
        [
          `#${order.id}`,
          order.customer.firstName,
          order.customer.lastName,
          order.customer.email,
          ...order.items.map((item) => item.productName),
          ...order.items.map((item) => item.productSku),
        ].some((value) => value.toLowerCase().includes(normalized))

      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const createdOrders = useMemo(
    () => orders.filter((order) => order.status === "CREATED").length,
    [orders],
  )
  const cancelledOrders = orders.length - createdOrders
  const totalVolume = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders],
  )

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Order flow"
        title="Orders"
        description="Create transactional orders, review their contents and cancel valid ones without losing traceability."
        meta={<span>{formatNumber(orders.length)} recorded orders</span>}
        actions={<CreateOrderDialog />}
      />

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Orders could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Check the backend connection and try again.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError ? (
        <>
          <div className="ledger-reveal grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_repeat(2,minmax(0,1fr))]">
            <SectionCard variant="soft" className="space-y-4">
              <div className="space-y-2">
                <p className="ledger-kicker">Transaction posture</p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Search by order number, customer or product, then narrow by status when operators need to act quickly.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by order, customer or product"
                    className="bg-muted pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "ALL" | "CREATED" | "CANCELLED")}>
                  <SelectTrigger className="w-full bg-muted">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{formatNumber(rows.length)} visible results</span>
                {(search.trim() || statusFilter !== "ALL") ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch("")
                      setStatusFilter("ALL")
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </SectionCard>

            <MetricCard
              label="Open orders"
              value={formatNumber(createdOrders)}
              detail={`${formatNumber(cancelledOrders)} cancelled orders remain available for reference.`}
              icon={<ShoppingCart className="size-4" />}
            />
            <MetricCard
              label="Recorded volume"
              value={formatMoney(totalVolume)}
              detail="Combined total amount across the current order history."
              icon={<UserRound className="size-4" />}
            />
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Create the first order to validate the end-to-end transactional flow across customers, products and inventory."
              action={<CreateOrderDialog />}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No orders match these filters"
              description="Clear the current filters or try a broader search term to recover the relevant order history."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("ALL")
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <SectionCard variant="bare" className="ledger-reveal overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {rows.map((order) => {
                    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0)

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="min-w-[140px]">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(order.items.length)} lines · {formatNumber(totalUnits)} units
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[220px]">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{formatMoney(order.totalAmount)}</TableCell>
                        <TableCell className="min-w-[320px] whitespace-normal">
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="rounded-xl border border-border/70 bg-muted/45 px-3 py-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground">{item.productSku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-foreground">
                                      {formatNumber(item.quantity)} x {formatMoney(item.unitPrice)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Subtotal {formatMoney(item.subtotal)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 ? (
                              <p className="text-xs text-muted-foreground">
                                +{formatNumber(order.items.length - 2)} additional lines in this order
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {order.status === "CREATED" ? (
                            <CancelOrderDialog
                              orderId={order.id}
                              customerName={`${order.customer.firstName} ${order.customer.lastName}`}
                              totalAmount={order.totalAmount}
                              itemCount={order.items.length}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </SectionCard>
          )}
        </>
      ) : null}
    </section>
  )
}
