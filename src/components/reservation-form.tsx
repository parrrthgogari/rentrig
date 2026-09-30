'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reservationSchema, type ReservationInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/stores/cart-store'
import { useSession } from '@/lib/auth-client'
import { getDaysBetween } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, ShoppingCart, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface ReservationFormProps {
  equipmentId: string
  equipmentName: string
  pricePerDay: number
  imageUrl: string | null
  available: boolean
}

export function ReservationForm({
  equipmentId,
  equipmentName,
  pricePerDay,
  imageUrl,
  available,
}: ReservationFormProps) {
  const { data: session } = useSession()
  const { addItem, items } = useCartStore()
  const [isPending, startTransition] = useTransition()
  const inCart = items.some((i) => i.equipmentId === equipmentId)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { equipmentId },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const days =
    startDate && endDate && new Date(endDate) > new Date(startDate)
      ? getDaysBetween(new Date(startDate), new Date(endDate))
      : 0
  const totalPrice = days * pricePerDay

  const onSubmit = (data: ReservationInput) => {
    if (!session?.user) {
      toast.error('Please sign in to reserve equipment')
      return
    }
    startTransition(() => {
      addItem({
        equipmentId,
        name: equipmentName,
        pricePerDay,
        imageUrl,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        totalPrice,
      })
      toast.success(`${equipmentName} added to your reservation cart!`)
    })
  }

  if (!available) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground font-medium">This equipment is currently unavailable.</p>
        <p className="text-sm text-muted-foreground mt-1">Check back soon or browse similar items.</p>
      </div>
    )
  }

  if (inCart) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Added to cart!</span>
        </div>
        <Link href="/cart">
          <Button className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('equipmentId')} />

      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...register('startDate')}
        />
        {errors.startDate && (
          <p className="text-sm text-destructive">{errors.startDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Input
          type="date"
          min={startDate || new Date().toISOString().split('T')[0]}
          {...register('endDate')}
        />
        {errors.endDate && (
          <p className="text-sm text-destructive">{errors.endDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Input placeholder="Any special requirements..." {...register('notes')} />
      </div>

      {days > 0 && (
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium">₹{pricePerDay.toLocaleString('en-IN')}/day</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {!session?.user ? (
        <Link href="/auth/login" className="block">
          <Button className="w-full" variant="outline">
            Sign In to Reserve
          </Button>
        </Link>
      ) : (
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart</>
          )}
        </Button>
      )}
    </form>
  )
}
