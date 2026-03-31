"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { createOrder, type CreateOrderItemRequest } from "@/lib/admin-orders-api"
import { fetchProductsFromApi } from "@/lib/admin-products-api"
import type { Product } from "@/lib/mock-data"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClipboardList, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react"

interface OrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface OrderItemTemp extends Product {
  quantity: number
}

function isAdminRole(role?: string) {
  return role === "ROLE_ADMIN" || role === "ADMIN"
}

function getProductMaxQuantity(product: Product) {
  return typeof product.maxQuantity === "number" && product.maxQuantity >= 0
    ? product.maxQuantity
    : undefined
}

export function OrderModal({ open, onOpenChange, onSuccess }: OrderModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemTemp[]>([])
  const [tableId, setTableId] = useState("1")
  const [orderSource, setOrderSource] = useState("IN_STORE")
  const [methodPayment, setMethodPayment] = useState("CASH")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const shouldApplyAdminAvailability = isAdminRole(user?.role)

  useEffect(() => {
    if (!open) {
      return
    }

    let isActive = true

    async function loadProducts() {
      setProductsLoading(true)
      setLoadError(null)

      try {
        const data = await fetchProductsFromApi(0, 100, "name", "asc")
        const activeProducts = data.content.filter((product) => product.active)

        if (!isActive) {
          return
        }

        setProducts(activeProducts)

        const uniqueGroups = Array.from(
          new Set(activeProducts.map((product) => product.groupId).filter(Boolean)),
        )
        setCategories(["All", ...uniqueGroups.map(String)])
      } catch (error) {
        console.error("Failed to load products for order creation", error)

        if (isActive) {
          setLoadError("Unable to load products right now.")
          setProducts([])
          setCategories(["All"])
        }
      } finally {
        if (isActive) {
          setProductsLoading(false)
        }
      }
    }

    void loadProducts()

    setOrderItems([])
    setTableId("1")
    setOrderSource("IN_STORE")
    setMethodPayment("CASH")
    setSearchTerm("")
    setSelectedCategory("All")
    setSubmitError(null)

    return () => {
      isActive = false
    }
  }, [open])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === "All" || product.groupId.toString() === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const orderQuantityById = useMemo(() => {
    return orderItems.reduce<Record<number, number>>((accumulator, item) => {
      accumulator[item.id] = item.quantity
      return accumulator
    }, {})
  }, [orderItems])

  const totalAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [orderItems])

  const totalUnits = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [orderItems])

  function isUnavailableForAdmin(product: Product) {
    return shouldApplyAdminAvailability && product.available === false
  }

  function isAtMaxQuantity(product: Product) {
    const maxQuantity = getProductMaxQuantity(product)
    const selectedQuantity = orderQuantityById[product.id] ?? 0

    return maxQuantity !== undefined && selectedQuantity >= maxQuantity
  }

  function getCardStatusLabel(product: Product) {
    if (isUnavailableForAdmin(product)) {
      return "Out of ingredients"
    }

    if (isAtMaxQuantity(product)) {
      return "Max reached"
    }

    return null
  }

  function canSelectProduct(product: Product) {
    return !isUnavailableForAdmin(product) && !isAtMaxQuantity(product)
  }

  function addItemToOrder(product: Product) {
    if (!canSelectProduct(product)) {
      return
    }

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      const maxQuantity = getProductMaxQuantity(product)

      if (existing) {
        const nextQuantity = existing.quantity + 1

        if (maxQuantity !== undefined && nextQuantity > maxQuantity) {
          return prev
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item,
        )
      }

      if (maxQuantity === 0) {
        return prev
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function updateQuantity(id: number, delta: number) {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) {
            return item
          }

          const nextQuantity = item.quantity + delta
          const maxQuantity = getProductMaxQuantity(item)

          if (nextQuantity <= 0) {
            return null
          }

          if (maxQuantity !== undefined && nextQuantity > maxQuantity) {
            return item
          }

          return { ...item, quantity: nextQuantity }
        })
        .filter((item): item is OrderItemTemp => item !== null),
    )
  }

  function removeFromOrder(id: number) {
    setOrderItems((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleSubmit() {
    if (orderItems.length === 0 || !tableId) {
      return
    }

    if (shouldApplyAdminAvailability && orderItems.some((item) => item.available === false)) {
      setSubmitError("Unavailable products cannot be submitted in admin order creation.")
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      const items: CreateOrderItemRequest[] = orderItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      await createOrder({
        orderSource,
        tableId: Number(tableId),
        userId: 1,
        employeeId: user?.id ? parseInt(user.id.replace(/\D/g, "") || "1", 10) : 1,
        status: "PENDING",
        totalAmount,
        items,
        methodPayment,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create order", error)
      setSubmitError("Order creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col overflow-hidden p-0 sm:max-w-[1100px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Build an order without leaving the admin orders page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex flex-1 flex-col border-b bg-muted/10 lg:w-[58%] lg:border-b-0 lg:border-r">
            <div className="space-y-4 border-b bg-background px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-foreground/90">
                    <ClipboardList className="size-4" />
                    Products
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {shouldApplyAdminAvailability
                      ? "Admin availability rules are active."
                      : "Availability restrictions are not enforced for this role."}
                  </p>
                </div>
                <Badge variant="outline">{filteredProducts.length} shown</Badge>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                {categories.length > 1 ? (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "All" ? "All Categories" : `Group ${category}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {productsLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-2xl border bg-muted/30"
                    />
                  ))
                ) : loadError ? (
                  <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-destructive">
                    {loadError}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    No products match your current search.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      disabled={!canSelectProduct(product)}
                      quantity={orderQuantityById[product.id] ?? 0}
                      statusLabel={getCardStatusLabel(product)}
                      onSelect={addItemToOrder}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col bg-background lg:w-[42%]">
            <div className="space-y-4 border-b px-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <ShoppingCart className="size-4" />
                  Order Summary
                </h3>
                <Badge variant="secondary">{totalUnits} item(s)</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="table-id">Table ID</Label>
                  <Input
                    id="table-id"
                    type="number"
                    min="1"
                    value={tableId}
                    onChange={(event) => setTableId(event.target.value)}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Source</Label>
                  <Select value={orderSource} onValueChange={setOrderSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_STORE">In Store</SelectItem>
                      <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Payment</Label>
                  <Select value={methodPayment} onValueChange={setMethodPayment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANKING">Banking</SelectItem>
                      <SelectItem value="MOMO">Momo</SelectItem>
                      <SelectItem value="VNPAY">VNPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-muted/5 px-4 py-4">
              {orderItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  <ShoppingCart className="mb-3 size-8 opacity-50" />
                  Select a product to start building the order.
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => {
                    const atMax = isAtMaxQuantity(item)

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border bg-card p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium leading-tight">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 rounded-full border bg-muted/20 p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="size-4" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={atMax}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            {atMax ? (
                              <Badge variant="outline">Max reached</Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-600"
                              onClick={() => removeFromOrder(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="space-y-4 border-t bg-background px-4 py-4">
              {submitError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}

              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Products selected</span>
                  <span>{orderItems.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={loading || orderItems.length === 0 || !tableId}
                >
                  {loading ? "Creating..." : "Submit Order"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
