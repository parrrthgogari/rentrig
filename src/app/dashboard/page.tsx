import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Reservation } from '@prisma/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Dashboard' }

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  ACTIVE: 'success',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/auth/login')

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { equipment: true },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total: reservations.length,
    active: reservations.filter((r: Reservation) => r.status === 'ACTIVE').length,
    completed: reservations.filter((r: Reservation) => r.status === 'COMPLETED').length,
    spent: reservations
      .filter((r: Reservation) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(r.status))
      .reduce((sum: number, r: Reservation) => sum + r.totalPrice, 0),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reservations', value: stats.total },
            { label: 'Active Rentals', value: stats.active },
            { label: 'Completed', value: stats.completed },
            { label: 'Total Spent', value: formatCurrency(stats.spent) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reservation History</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reservations yet.{' '}
                <a href="/equipment" className="text-primary hover:underline">
                  Browse equipment
                </a>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Equipment</th>
                      <th className="text-left py-3 px-2">Dates</th>
                      <th className="text-left py-3 px-2">Total</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{res.equipment.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {formatDate(res.startDate)} – {formatDate(res.endDate)}
                        </td>
                        <td className="py-3 px-2 font-semibold">{formatCurrency(res.totalPrice)}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusVariant[res.status]}>{res.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
