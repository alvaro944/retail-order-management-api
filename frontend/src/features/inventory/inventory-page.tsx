import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, Warehouse, Wrench } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { FormField } from "@/components/app/form-field"
import { LoadingBlock } from "@/components/app/loading-block"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { formatDateTime } from "@/lib/format"
import { createInventory, getInventory, inventoryQueryKey } from "@/features/inventory/api"
import { getProducts, productQueryKey } from "@/features/products/api"

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantityAvailable: z.coerce.number().min(0, "Quantity must be zero or greater"),
  minimumStock: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
})

type FormValues = z.output<typeof schema>

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
      toast.success("Inventory created")
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
      <SheetTrigger render={<Button className="h-10 rounded-md ledger-primary-gradient text-primary-foreground" />}>
        <Wrench className="size-4" />
        Create inventory
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border">
          <SheetTitle>Create inventory</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Crea el único registro de inventario permitido para un producto activo.
          </p>
        </SheetHeader>
        <form className="space-y-5 p-4" onSubmit={submit}>
          <FormField label="Product" htmlFor="inventory-product" error={form.formState.errors.productId?.message}>
            <Select value={selectedProductId} onValueChange={(value) => form.setValue("productId", value ?? "")}>
              <SelectTrigger id="inventory-product" className="h-11 w-full bg-muted">
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
          <FormField label="Quantity available" htmlFor="inventory-quantity" error={form.formState.errors.quantityAvailable?.message}>
            <Input id="inventory-quantity" type="number" className="h-11 bg-muted" {...form.register("quantityAvailable")} />
          </FormField>
          <FormField label="Minimum stock" htmlFor="inventory-minimum" error={form.formState.errors.minimumStock?.message as string | undefined}>
            <Input id="inventory-minimum" type="number" className="h-11 bg-muted" {...form.register("minimumStock")} />
          </FormField>
          <SheetFooter className="border-t border-border bg-muted/40">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save inventory"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function InventoryPage() {
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: inventoryQueryKey,
    queryFn: getInventory,
  })

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return query.data ?? []
    }

    return (query.data ?? []).filter((inventory) =>
      [inventory.product.name, inventory.product.sku].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    )
  }, [query.data, search])

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Inventory control"
        title="Inventory"
        description="Supervisa disponibilidad actual, stock mínimo y salud de inventario por producto activo."
        actions={<CreateInventorySheet />}
      />

      <div className="rounded-2xl bg-card p-5 ledger-shadow ledger-ghost-border">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or SKU"
            className="h-11 bg-muted pl-10"
          />
        </div>
      </div>

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
          <AlertTitle>Inventory could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Retry after checking the backend connection.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No inventory records yet"
          description="Create inventory for an active product to start monitoring available stock and minimum thresholds."
        />
      ) : null}

      {!query.isLoading && !query.isError && rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-card ledger-shadow ledger-ghost-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inventory) => {
                const isLowStock =
                  inventory.minimumStock !== null &&
                  inventory.quantityAvailable <= inventory.minimumStock

                return (
                  <TableRow key={inventory.id}>
                    <TableCell className="font-medium">{inventory.product.name}</TableCell>
                    <TableCell>{inventory.product.sku}</TableCell>
                    <TableCell>{inventory.quantityAvailable}</TableCell>
                    <TableCell>{inventory.minimumStock ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={isLowStock ? "LOW" : "HEALTHY"} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(inventory.updatedAt)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  )
}
