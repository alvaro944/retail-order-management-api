import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PackagePlus, PencilLine, Search, Trash2 } from "lucide-react"
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
import { formatMoney, formatNumber } from "@/lib/format"
import { createProduct, deleteProduct, getProducts, productQueryKey, updateProduct } from "@/features/products/api"
import { buildProductPayload } from "@/features/products/product-payload"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive("Price must be greater than zero"),
  sku: z.string().min(1, "SKU is required").max(64),
})

type FormValues = z.output<typeof schema>
type ProductFormController = ReturnType<typeof useForm<z.input<typeof schema>, unknown, FormValues>>

function ProductFormFields({
  form,
  nameId,
  skuId,
  priceId,
  descriptionId,
}: {
  form: ProductFormController
  nameId: string
  skuId: string
  priceId: string
  descriptionId: string
}) {
  return (
    <>
      <FormField label="Name" htmlFor={nameId} error={form.formState.errors.name?.message}>
        <Input id={nameId} className="bg-muted" {...form.register("name")} />
      </FormField>
      <FormField label="SKU" htmlFor={skuId} error={form.formState.errors.sku?.message}>
        <Input id={skuId} className="bg-muted" {...form.register("sku")} />
      </FormField>
      <FormField label="Price" htmlFor={priceId} error={form.formState.errors.price?.message}>
        <Input id={priceId} type="number" step="0.01" className="bg-muted" {...form.register("price")} />
      </FormField>
      <FormField label="Description" htmlFor={descriptionId} error={form.formState.errors.description?.message}>
        <textarea
          id={descriptionId}
          className="min-h-28 w-full rounded-xl border border-input bg-muted px-3.5 py-3 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...form.register("description")}
        />
      </FormField>
    </>
  )
}

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
      toast.success("Product created successfully.")
      setOpen(false)
      form.reset()
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(buildProductPayload(values))
    } catch (error) {
      toast.error(getProblemDetailMessage(error, "Product could not be created."))
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="ledger-primary-gradient text-primary-foreground" />}>
        <PackagePlus className="size-4" />
        New product
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <SheetHeader className="space-y-2 border-b border-border p-6">
          <SheetTitle>Create product</SheetTitle>
          <p className="text-sm leading-7 text-muted-foreground">Add a new item to the catalog.</p>
        </SheetHeader>
        <form className="space-y-5 p-6" onSubmit={submit}>
          <ProductFormFields
            form={form}
            nameId="product-name"
            skuId="product-sku"
            priceId="product-price"
            descriptionId="product-description"
          />
          <SheetFooter className="border-t border-border bg-muted/35 p-6">
            <Button type="submit" className="ledger-primary-gradient text-primary-foreground" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving product..." : "Save product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function EditProductDialog({
  id,
  name,
  sku,
  price,
  description,
}: {
  id: number
  name: string
  sku: string
  price: number
  description: string | null
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      sku,
      price,
      description: description ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateProduct(id, buildProductPayload(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKey })
      toast.success("Product updated successfully.")
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
            name,
            sku,
            price,
            description: description ?? "",
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
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Update <span className="font-medium text-foreground">{name}</span> without leaving the list.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5 p-6"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutation.mutateAsync(values)
            } catch (error) {
              toast.error(getProblemDetailMessage(error, "Product could not be updated."))
            }
          })}
        >
          <ProductFormFields
            form={form}
            nameId={`product-name-${id}`}
            skuId={`product-sku-${id}`}
            priceId={`product-price-${id}`}
            descriptionId={`product-description-${id}`}
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

function DeactivateProductDialog({
  id,
  name,
}: {
  id: number
  name: string
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKey })
      toast.success("Product removed from the active catalog.")
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
          <DialogTitle>Remove product</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{name}</span> will be removed from the active catalog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
          <p>If the product still has inventory, the action will be blocked.</p>
        </div>
        <DialogFooter className="border-t border-border bg-muted/35 px-6 py-5">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep product
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await mutation.mutateAsync()
              } catch (error) {
                toast.error(getProblemDetailMessage(error, "Product could not be removed."))
              }
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Removing..." : "Remove product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsPage() {
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: productQueryKey,
    queryFn: getProducts,
  })

  const products = useMemo(() => query.data ?? [], [query.data])

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.sku, product.description ?? ""].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    )
  }, [products, search])

  const hasActiveFilters = search.trim().length > 0

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Search, add and update products in one place."
        meta={<span>{formatNumber(products.length)} active records</span>}
        actions={<CreateProductSheet />}
      />

      {query.isLoading ? <LoadingBlock /> : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Products could not be loaded</AlertTitle>
          <AlertDescription>{getProblemDetailMessage(query.error, "Check the backend connection and try again.")}</AlertDescription>
        </Alert>
      ) : null}

      {!query.isLoading && !query.isError ? (
        <>
          <div className="ledger-reveal grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
            <SectionCard variant="soft" className="space-y-4">
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, SKU or description"
                  className="bg-muted pl-10"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{formatNumber(rows.length)} visible results</span>
                {hasActiveFilters ? (
                  <Button variant="ghost" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                ) : null}
              </div>
            </SectionCard>

            <MetricCard
              label="Catalog size"
              value={formatNumber(products.length)}
              icon={<PackagePlus className="size-4" />}
            />
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={PackagePlus}
              title="No products yet"
              description="Create the first product to start using inventory and orders."
              action={<CreateProductSheet />}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No products match this search"
              description="Try a broader term or clear the search."
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
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="min-w-[220px]">
                        <p className="font-medium text-foreground">{product.name}</p>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{product.sku}</TableCell>
                      <TableCell className="max-w-[380px] whitespace-normal text-sm leading-6 text-muted-foreground">
                        {product.description || "No description"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{formatMoney(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EditProductDialog
                            id={product.id}
                            name={product.name}
                            sku={product.sku}
                            price={product.price}
                            description={product.description}
                          />
                          <DeactivateProductDialog id={product.id} name={product.name} />
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
