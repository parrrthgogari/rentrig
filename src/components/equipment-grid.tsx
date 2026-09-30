'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Equipment } from '@prisma/client'

const categoryLabels: Record<string, string> = {
  GPU_SERVER: 'GPU Server',
  DRONE: 'Drone',
  LAB_INSTRUMENT: 'Lab Instrument',
  VR_AR_HEADSET: 'VR / AR Headset',
  CAMERA_GEAR: 'Camera Gear',
  ROBOTICS_KIT: 'Robotics Kit',
}

export function EquipmentGrid({ equipment }: { equipment: Equipment[] }) {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground text-lg">No equipment found matching your filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or clearing filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {equipment.map((item) => (
        <Link key={item.id} href={`/equipment/${item.slug}`}>
          <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
            <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <CardHeader className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                <Badge variant={item.available ? 'success' : 'destructive'} className="shrink-0">
                  {item.available ? 'Available' : 'Rented'}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(item.pricePerDay)}
                  <span className="text-xs font-normal text-muted-foreground">/day</span>
                </span>
                <Badge variant="secondary">{categoryLabels[item.category] || item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
