'use client'

import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, clearCart, grandTotal } = useCartStore()
  const { data: session } = useSession()
  const router = useRouter()

  const handleCheckout = async () => {
    if (!session?.user) {
      toast.error('Please sign in to complete your reservation')
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (response.ok) {
        clearCart()
        toast.success('Reservations confirmed! Check your email for details.')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create reservations')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse our equipment catalog and add items to get started.</p>
        <Link href="/equipment">
          <Button>Browse Equipment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reservation Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.equipmentId}>
              <CardContent className="flex gap-4 p-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-16 object-cover rounded-md shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.startDate} – {item.endDate} · {item.days} day{item.days !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm">
                    {formatCurrency(item.pricePerDay)}/day × {item.days} ={' '}
                    <span className="font-semibold text-primary">{formatCurrency(item.totalPrice)}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.equipmentId)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.equipmentId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[160px]">{item.name}</span>
                  <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(grandTotal())}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Confirm Reservations
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
