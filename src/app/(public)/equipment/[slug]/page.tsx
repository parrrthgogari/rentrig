import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReservationForm } from '@/components/reservation-form'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const equipment = await prisma.equipment.findUnique({ where: { slug } })
  if (!equipment) return { title: 'Not Found' }
  return {
    title: equipment.name,
    description: equipment.description,
    openGraph: {
      title: equipment.name,
      description: equipment.description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(equipment.name)}&category=${equipment.category}&price=${equipment.pricePerDay}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

const categoryLabels: Record<string, string> = {
  GPU_SERVER: 'GPU Server',
  DRONE: 'Drone',
  LAB_INSTRUMENT: 'Lab Instrument',
  VR_AR_HEADSET: 'VR / AR Headset',
  CAMERA_GEAR: 'Camera Gear',
  ROBOTICS_KIT: 'Robotics Kit',
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { slug } = await params
  const equipment = await prisma.equipment.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!equipment) notFound()

  const specs = equipment.specs as Record<string, unknown>
  const avgRating =
    equipment.reviews.length > 0
      ? equipment.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / equipment.reviews.length
      : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image & Info */}
        <div>
          <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-6">
            {equipment.imageUrl && (
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{equipment.name}</h1>
              <p className="text-muted-foreground">
                {equipment.brand} · {equipment.model}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={equipment.available ? 'success' : 'destructive'}>
                {equipment.available ? 'Available' : 'Unavailable'}
              </Badge>
              <Badge variant="secondary">{categoryLabels[equipment.category]}</Badge>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">{equipment.description}</p>

          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm font-medium">
                    {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviews */}
          {equipment.reviews.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-4">
                Reviews {avgRating && `· ${avgRating.toFixed(1)} ★`}
              </h3>
              {equipment.reviews.map((review) => (
                <div key={review.id} className="border-b py-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user.name}</span>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Reservation Form */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(equipment.pricePerDay)}
                </span>
                <span className="text-sm font-normal text-muted-foreground">/day</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationForm
                equipmentId={equipment.id}
                equipmentName={equipment.name}
                pricePerDay={equipment.pricePerDay}
                imageUrl={equipment.imageUrl}
                available={equipment.available}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
