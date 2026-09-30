import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Zap, Server, Camera, Cpu, Microscope, Bot, Glasses } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RentRig – Premium Hardware Rental',
  description: 'Rent GPU servers, drones, lab instruments, VR headsets, camera gear, and robotics kits.',
}

const categoryIcons = {
  GPU_SERVER: Server,
  DRONE: Cpu,
  LAB_INSTRUMENT: Microscope,
  VR_AR_HEADSET: Glasses,
  CAMERA_GEAR: Camera,
  ROBOTICS_KIT: Bot,
}

const categoryLabels: Record<string, string> = {
  GPU_SERVER: 'GPU Servers',
  DRONE: 'Drones',
  LAB_INSTRUMENT: 'Lab Instruments',
  VR_AR_HEADSET: 'VR / AR',
  CAMERA_GEAR: 'Camera Gear',
  ROBOTICS_KIT: 'Robotics',
}

export default async function HomePage() {
  const [featuredEquipment, totalEquipment] = await Promise.all([
    prisma.equipment.findMany({
      where: { available: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.equipment.count(),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span>{totalEquipment}+ pieces of premium gear available</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Rent the Hardware<br />
          <span className="text-primary">You Actually Need</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          GPU clusters, industrial drones, lab instruments, VR rigs — available by the day.
          No upfront investment, just performance.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/equipment">
            <Button size="lg">Browse Equipment</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-10">
        <h2 className="text-2xl font-semibold text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons]
            return (
              <Link key={key} href={`/equipment?category=${key}`}>
                <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer text-center">
                  <CardContent className="pt-6 pb-4 flex flex-col items-center gap-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Equipment */}
      <section className="py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Featured Equipment</h2>
          <Link href="/equipment">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEquipment.map((item) => (
            <Link key={item.id} href={`/equipment/${item.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <Badge variant="success" className="shrink-0">Available</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.pricePerDay)}
                      <span className="text-xs font-normal text-muted-foreground">/day</span>
                    </span>
                    <Badge variant="secondary">{categoryLabels[item.category]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
