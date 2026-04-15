import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, PencilLine, Search, Warehouse, Wrench } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { MetricCard } from "@/components/app/metric-card"
import { LoadingBlock } from "@/components/app/loading-block"
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
import {
  adjustInventory,
  createInventory,
  getInventory,
  inventoryQueryKey,
  updateInventory,
} from "@/features/inventory/api"
import { getInventoryAdjustmentFromTarget } from "@/features/inventory/inventory-utils"
import { getProducts, productQueryKey } from "@/features/products/api"

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantityAvailable: z.coerce.number().min(0, "Quantity must be zero or greater"),
  minimumStock: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
})

type FormValues = z.output<typeof schema>

const editInventorySchema = z.object({
  desiredQuantity: z.coerce.number().min(0, "Quantity must be zero or greater"),
  minimumStock: z.coerce.number().min(0, "Minimum stock must be zero or greater"),
})

type EditInventoryValues = z.output<typeof editInventorySchema>

function CreateInventorySheet() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const productsQuery = useQuery({
    queryKey: productQueryKey,
    queryFn: getProducts,
  })

  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      quantityAvailable: 0,
      minimumStock: 0,
    },
  })
  const selectedProductId = useWatch({ control: form.control, name: "productId" })

  const mutation = useMutation({
    mutationFn: createInventory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inventoryQueryKey })
      toast.success("Inventory record created successfully.")
      setOpen(false)
      form.reset()
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        productId: Number(values.productId),
        quantityAvailable: values.quantityAvailable,
        minimumStock:
          values.minimumStock === "" || values.minimumStock === undefined
            ? undefined
            : Number(values.minimumStock),
      })
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Inventory could not be created."))
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="ledger-primary-gradient text-primary-foreground" />}>
        <Wrench className="size-4" />
        New inventory record
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border p-6">
          <SheetTitle>Create inventory</SheetTitle>
          <p className="text-sm leading-7 text-muted-foreground">Create a stock record for an active product.</p>
        </SheetHeader>
        <form className="space-y-5 p-6" onSubmit={submit}>
          <FormField label="Product" htmlFor="inventory-product" error={form.formState.errors.productId?.message}>
            <Select value={selectedProductId} onValueChange={(value) => form.setValue("productId", value ?? "")}>
              <SelectTrigger id="inventory-product" className="w-full bg-muted">
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
          <FormField label="Quantity available" htmlFor="inventory-quantity" error={form.formState.errors.quantityAvailable?.message}>
            <Input id="inventory-quantity" type="number" className="bg-muted" {...form.register("quantityAvailable")} />
          </FormField>
          <FormField label="Minimum stock" htmlFor="inventory-minimum" error={form.formState.errors.minimumStock?.message as string | undefined}>
            <Input id="inventory-minimum" type="number" className="bg-muted" {...form.register("minimumStock")} />
          </FormField>
          <SheetFooter className="border-t border-border bg-muted/35 p-6">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving inventory..." : "Save inventory"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function EditInventoryDialog({
  inventoryId,
  productName,
  currentQuantity,
  currentMinimumStock,
}: {
  inventoryId: number
  productName: string
  currentQuantity: number
  currentMinimumStock: number | null
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof editInventorySchema>, unknown, EditInventoryValues>({
    resolver: zodResolver(editInventorySchema),
    defaultValues: {
      desiredQuantity: currentQuantity,
      minimumStock: currentMinimumStock ?? 0,
    },
  })
  const desiredQuantity = useWatch({ control: form.control, name: "desiredQuantity" }) ?? currentQuantity
  const minimumStock = useWatch({ control: form.control, name: "minimumStock" }) ?? (currentMinimumStock ?? 0)
  const normalizedDesiredQuantity = Number(desiredQuantity) || 0
  const normalizedMinimumStock = Number(minimumStock) || 0
  const quantityDelta = normalizedDesiredQuantity - currentQuantity
  const hasQuantityChange = normalizedDesiredQuantity !== currentQuantity
  const hasMinimumStockChange = normalizedMinimumStock !== (currentMinimumStock ?? 0)

  const mutation = useMutation({
    mutationFn: async (values: EditInventoryValues) => {
      const operations: Promise<unknown>[] = []
      const quantityAdjustment = getInventoryAdjustmentFromTarget(currentQuantity, values.desiredQuantity)

      if (quantityAdjustment) {
        operations.push(adjustInventory(inventoryId, quantityAdjustment))
      }

      if (values.minimumStock !== (currentMinimumStock ?? 0)) {
        operations.push(updateInventory(inventoryId, { minimumStock: values.minimumStock }))
      }

      await Promise.all(operations)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inventoryQueryKey })
      toast.success("Inventory updated successfully.")
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
            desiredQuantity: currentQuantity,
            minimumStock: currentMinimumStock ?? 0,
          })
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilLine className="size-4" />
        Edit stock
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-[1.5rem] bg-card p-0">
        <DialogHeader className="space-y-2 border-b border-border p-6">
          <DialogTitle>Edit inventory</DialogTitle>
          <DialogDescription>
            Update stock and threshold for <span className="font-medium text-foreground">{productName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5 p-6"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutation.mutateAsync(values)
            } catch (error) {
              toast.error(getProblemDetailMessage(error, "Inventory could not be updated."))
            }
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-t border-border/80 pt-3">
              <p className="ledger-kicker">Current quantity</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                {formatNumber(currentQuantity)}
              </p>
            </div>
            <div className="border-t border-border/80 pt-3">
              <p className="ledger-kicker">Target quantity</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                {formatNumber(normalizedDesiredQuantity)}
              </p>
            </div>
          </div>

          {hasQuantityChange ? (
            <div className="rounded-[1rem] border border-border/80 bg-muted/55 px-4 py-3 text-sm text-muted-foreground">
              {quantityDelta > 0
                ? `This will increase stock by ${formatNumber(quantityDelta)} units.`
                : `This will decrease stock by ${formatNumber(Math.abs(quantityDelta))} units.`}
            </div>
          ) : null}

          <FormField label="Quantity available" htmlFor={`desired-quantity-${inventoryId}`} error={form.formState.errors.desiredQuantity?.message}>
            <Input
              id={`desired-quantity-${inventoryId}`}
              type="number"
              className="bg-muted"
              {...form.register("desiredQuantity")}
            />
          </FormField>

          <FormField label="Minimum stock" htmlFor={`minimum-stock-${inventoryId}`} error={form.formState.errors.minimumStock?.message}>
            <Input
              id={`minimum-stock-${inventoryId}`}
              type="number"
              className="bg-muted"
              {...form.register("minimumStock")}
            />
          </FormField>

          <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
            <Button
              type="submit"
              className="ledger-primary-gradient text-primary-foreground"
              disabled={mutation.isPending || (!hasQuantityChange && !hasMinimumStockChange)}
            >
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InventoryPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW" | "HEALTHY">("ALL")
  const query = useQuery({
    queryKey: inventoryQueryKey,
    queryFn: getInventory,
  })

  const inventory = useMemo(() => query.data ?? [], [query.data])

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return inventory.filter((item) => {
      const isLowStock =
        item.minimumStock !== null && item.quantityAvailable <= item.minimumStock

      const matchesSearch =
        !normalized ||
        [item.product.name, item.product.sku].some((value) => value.toLowerCase().includes(normalized))

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "LOW" && isLowStock) ||
        (statusFilter === "HEALTHY" && !isLowStock)

      return matchesSearch && matchesStatus
    })
  }, [inventory, search, statusFilter])

  const lowStockCount = useMemo(
    () =>
      inventory.filter(
        (item) => item.minimumStock !== null && item.quantityAvailable <= item.minimumStock,
      ).length,
    [inventory],
  )
  const totalUnits = useMemo(
    () => inventory.reduce((sum, item) => sum + item.quantityAvailable, 0),
    [inventory],
  )

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Inventory"
        description="Track stock levels, thresholds and low-stock risk."
        meta={<span>{formatNumber(inventory.length)} tracked products</span>}
        actions={<CreateInventorySheet />}
      />

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Inventory could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Check the backend connection and try again.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError ? (
        <>
          <div className="ledger-reveal grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_repeat(2,minmax(0,1fr))]">
            <SectionCard variant="soft" className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by product name or SKU"
                    className="bg-muted pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "ALL" | "LOW" | "HEALTHY")}>
                  <SelectTrigger className="w-full bg-muted">
                    <SelectValue placeholder="Filter by stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All records</SelectItem>
                    <SelectItem value="LOW">Low stock only</SelectItem>
                    <SelectItem value="HEALTHY">Healthy only</SelectItem>
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
              label="Units available"
              value={formatNumber(totalUnits)}
              icon={<Warehouse className="size-4" />}
            />
            <MetricCard
              label="Low-stock products"
              value={formatNumber(lowStockCount)}
              icon={<AlertTriangle className="size-4" />}
              accent={lowStockCount > 0 ? "danger" : "default"}
            />
          </div>

          {inventory.length === 0 ? (
            <EmptyState
              icon={Warehouse}
              title="No inventory records yet"
              description="Create inventory for an active product to start tracking availability."
              action={<CreateInventorySheet />}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No inventory records match these filters"
              description="Clear the filters or try a broader search."
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
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => {
                    const isLowStock =
                      item.minimumStock !== null && item.quantityAvailable <= item.minimumStock

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="min-w-[220px]">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{item.product.sku}</TableCell>
                        <TableCell className="font-medium text-foreground">{formatNumber(item.quantityAvailable)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.minimumStock ?? "None"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={isLowStock ? "LOW" : "HEALTHY"} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditInventoryDialog
                              inventoryId={item.id}
                              productName={item.product.name}
                              currentQuantity={item.quantityAvailable}
                              currentMinimumStock={item.minimumStock}
                            />
                          </div>
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
