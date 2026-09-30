'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filter-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useEffect } from 'react'

const CATEGORIES = [
  { value: 'GPU_SERVER', label: 'GPU Servers' },
  { value: 'DRONE', label: 'Drones' },
  { value: 'LAB_INSTRUMENT', label: 'Lab Instruments' },
  { value: 'VR_AR_HEADSET', label: 'VR / AR' },
  { value: 'CAMERA_GEAR', label: 'Camera Gear' },
  { value: 'ROBOTICS_KIT', label: 'Robotics' },
] as const

export function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { search, categories, minPrice, maxPrice, availableOnly, sortBy,
    setSearch, toggleCategory, setMinPrice, setMaxPrice,
    setAvailableOnly, setSortBy, resetFilters } = useFilterStore()

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categories.length === 1) params.set('category', categories[0])
    if (availableOnly) params.set('available', 'true')
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (minPrice > 0) params.set('minPrice', minPrice.toString())
    if (maxPrice < 5000) params.set('maxPrice', maxPrice.toString())
    router.push(`/equipment?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground -ml-2">
          Reset all
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <Input
          placeholder="GPU, drone, lab..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              variant={categories.includes(cat.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleCategory(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (per day)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => setMinPrice(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Available Only */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="available">Available only</Label>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort by</Label>
        <div className="space-y-1">
          {[
            { value: 'newest', label: 'Newest first' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
            { value: 'name_asc', label: 'Name A-Z' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as never)}
              className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-muted ${
                sortBy === option.value ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}
