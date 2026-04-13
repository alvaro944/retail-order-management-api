import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PackagePlus, Search } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { getProblemDetailMessage } from "@/lib/api/problem-detail"
import { formatDateTime, formatMoney } from "@/lib/format"
import { createProduct, getProducts, productQueryKey } from "@/features/products/api"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive("Price must be greater than zero"),
  sku: z.string().min(1, "SKU is required").max(64),
})

type FormValues = z.output<typeof schema>

function CreateProductSheet() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      sku: "",
    },
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKey })
      toast.success("Product created")
      setOpen(false)
      form.reset()
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Product could not be created."))
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="h-10 rounded-md ledger-primary-gradient text-primary-foreground" />}>
        <PackagePlus className="size-4" />
        Create product
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border">
          <SheetTitle>Create product</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Add a new active catalog item using the same backend validation rules exposed by the API.
          </p>
        </SheetHeader>
        <form className="space-y-5 p-4" onSubmit={submit}>
          <FormField label="Name" htmlFor="product-name" error={form.formState.errors.name?.message}>
            <Input id="product-name" className="h-11 bg-muted" {...form.register("name")} />
          </FormField>
          <FormField label="SKU" htmlFor="product-sku" error={form.formState.errors.sku?.message}>
            <Input id="product-sku" className="h-11 bg-muted" {...form.register("sku")} />
          </FormField>
          <FormField label="Price" htmlFor="product-price" error={form.formState.errors.price?.message}>
            <Input id="product-price" type="number" step="0.01" className="h-11 bg-muted" {...form.register("price")} />
          </FormField>
          <FormField label="Description" htmlFor="product-description" error={form.formState.errors.description?.message}>
            <Textarea id="product-description" className="min-h-28 bg-muted" {...form.register("description")} />
          </FormField>
          <SheetFooter className="border-t border-border bg-muted/40">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function ProductsPage() {
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: productQueryKey,
    queryFn: getProducts,
  })

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return query.data ?? []
    }

    return (query.data ?? []).filter((product) =>
      [product.name, product.sku, product.description ?? ""].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    )
  }, [query.data, search])

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Product catalog"
        title="Products"
        description="Consulta el catálogo activo, busca por nombre o SKU y da de alta nuevos productos desde la misma vista de trabajo."
        actions={<CreateProductSheet />}
      />

      <div className="rounded-2xl bg-card p-5 ledger-shadow ledger-ghost-border">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, SKU or description"
            className="h-11 bg-muted pl-10"
          />
        </div>
      </div>

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert className="border-destructive/20 bg-destructive/5 text-destructive">
          <AlertTitle>Products could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Retry after checking the backend connection.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="No products yet"
          description="When you create your first product it will appear here with price, SKU, timestamps, and active status."
        />
      ) : null}

      {!query.isLoading && !query.isError && rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-card ledger-shadow ledger-ghost-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="max-w-sm text-muted-foreground">
                    {product.description || "No description"}
                  </TableCell>
                  <TableCell>{formatMoney(product.price)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(product.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  )
}
