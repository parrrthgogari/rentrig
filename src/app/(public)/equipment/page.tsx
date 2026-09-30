import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { EquipmentGrid } from '@/components/equipment-grid'
import { FilterPanel } from '@/components/filter-panel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Equipment',
  description: 'Browse our full catalog of high-end hardware available for rent.',
}

interface SearchParams {
  category?: string
  search?: string
  available?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const where: Record<string, unknown> = {}

  if (params.category) {
    where.category = params.category
  }
  if (params.available === 'true') {
    where.available = true
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { brand: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ]
  }
  if (params.minPrice || params.maxPrice) {
    where.pricePerDay = {
      ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
    }
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (params.sort === 'price_asc') orderBy = { pricePerDay: 'asc' }
  if (params.sort === 'price_desc') orderBy = { pricePerDay: 'desc' }
  if (params.sort === 'name_asc') orderBy = { name: 'asc' }

  const equipment = await prisma.equipment.findMany({
    where,
    orderBy,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Equipment</h1>
        <p className="text-muted-foreground mt-1">
          {equipment.length} items available for rent
        </p>
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel />
        </aside>
        <div className="flex-1">
          <Suspense fallback={<div className="animate-pulse">Loading equipment...</div>}>
            <EquipmentGrid equipment={equipment} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
