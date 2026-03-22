"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { createOrder, CreateOrderItemRequest } from "@/lib/admin-orders-api"
import { fetchProductsFromApi } from "@/lib/admin-products-api"
import { Product } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus, ClipboardList, Trash2, Search } from "lucide-react"

interface CreateOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface OrderItemTemp extends Product {
  quantity: number
}

export function CreateOrderModal({ open, onOpenChange, onSuccess }: CreateOrderModalProps) {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemTemp[]>([])
  
  const [tableId, setTableId] = useState<string>("1")
  const [orderSource, setOrderSource] = useState<string>("IN_STORE")
  const [methodPayment, setMethodPayment] = useState<string>("CASH")

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [categories, setCategories] = useState<string[]>(["All"])

  useEffect(() => {
    if (open) {
      // Load first page of products for selection (limit 100 for POS fast selection)
      fetchProductsFromApi(0, 100, "name", "asc").then((data) => {
         const activeProducts = data.content.filter(p => p.active)
         setProducts(activeProducts)
         
         // Extract unique categories (`groupId`)
         const uniqueGroups = Array.from(new Set(activeProducts.map(p => p.groupId).filter(Boolean)))
         setCategories(["All", ...uniqueGroups])
      }).catch(console.error)
      
      // Reset state
      setOrderItems([])
      setTableId("1")
      setOrderSource("IN_STORE")
      setSearchTerm("")
      setSelectedCategory("All")
    }
  }, [open])

  // Memoized product filtering for fast UI updates without full re-renders
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || p.groupId === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const addItemToOrder = (product: Product) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, delta: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        return newQ > 0 ? { ...item, quantity: newQ } : item
      }
      return item
    }))
  }

  const removeFromOrder = (id: number) => {
    setOrderItems(prev => prev.filter(item => item.id !== id))
  }

  const totalAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [orderItems])

  const handleSubmit = async () => {
    if (orderItems.length === 0) return
    if (!tableId) return

    setLoading(true)
    try {
      const items: CreateOrderItemRequest[] = orderItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      // The backend expects number. Mock arbitrary userId and employeeId if not present
      await createOrder({
        orderSource,
        tableId: parseInt(tableId),
        userId: 1, // mocked user
        employeeId: user?.id ? parseInt(user.id.replace(/\D/g,'') || '1') : 1, 
        status: "PENDING",
        totalAmount,
        items,
        methodPayment
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create order", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Select a table and add items to create a POS order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Product Selection */}
          <div className="w-1/2 md:w-7/12 border-r flex flex-col bg-muted/10">
            {/* Sticky Search and Filter Header */}
            <div className="p-4 border-b space-y-4 bg-background z-10 sticky top-0">
              <h3 className="font-semibold flex items-center gap-2 text-foreground/80">
                <ClipboardList className="size-4"/>
                Menu Items
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {categories.length > 1 && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "All" ? "All" : cat}
                        </SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Scrollable Product Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3 pb-6">
                {products.length === 0 ? (
                  <div className="col-span-full text-sm text-center text-muted-foreground p-8">Loading menu...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                    <Search className="size-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No products found matching "{searchTerm}"</p>
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className="group border rounded-lg p-3 bg-card hover:border-primary cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col"
                      onClick={() => addItemToOrder(p)}
                    >
                      <div className="font-medium text-sm line-clamp-2" title={p.name}>{p.name}</div>
                      
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <div className="text-primary font-semibold text-sm">${p.price.toFixed(2)}</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary rounded-full size-6 flex items-center justify-center">
                          <Plus className="size-3.5" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-1/2 md:w-5/12 flex flex-col bg-background">
            <div className="p-4 border-b space-y-4 shrink-0">
              <div className="flex gap-4">
                <div className="space-y-1 w-1/3">
                  <Label>Table ID</Label>
                  <Input 
                    type="number" 
                    value={tableId} 
                    onChange={e => setTableId(e.target.value)} 
                    placeholder="E.g. 1"
                  />
                </div>
                <div className="space-y-1 w-1/3">
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
                <div className="space-y-1 w-1/3">
                  <Label>Payment Method</Label>
                  <Select value={methodPayment} onValueChange={setMethodPayment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">CASH</SelectItem>
                      <SelectItem value="BANKING">BANKING</SelectItem>
                      <SelectItem value="MOMO">MOMO</SelectItem>
                      <SelectItem value="VNPAY">VNPAY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-muted/5">
              {orderItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60">
                  <ClipboardList className="size-8 mb-3 opacity-50" />
                  No items added
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 border-border/50 bg-card p-3 rounded-md shadow-sm">
                      <div className="flex-1 pr-2">
                        <div className="font-medium text-sm leading-tight mb-1">{item.name}</div>
                        <div className="text-muted-foreground text-xs font-medium">${item.price.toFixed(2)} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-muted/30 p-1 rounded-md">
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6 shrink-0 rounded-sm" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6 shrink-0 rounded-sm" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="size-3" />
                        </Button>
                        <div className="w-[1px] h-4 bg-border mx-1"></div>
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0 rounded-sm" onClick={() => removeFromOrder(item.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
              </div>
              <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="w-full sm:w-auto shadow-md" onClick={handleSubmit} disabled={loading || orderItems.length === 0 || !tableId}>
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
