import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()

    const reservations = await Promise.all(
      items.map(async (item: {
        equipmentId: string
        startDate: string
        endDate: string
        totalPrice: number
        notes?: string
      }) => {
        const reservation = await prisma.reservation.create({
          data: {
            userId: session.user.id,
            equipmentId: item.equipmentId,
            startDate: new Date(item.startDate),
            endDate: new Date(item.endDate),
            totalPrice: item.totalPrice,
            status: 'CONFIRMED',
            notes: item.notes,
          },
          include: { equipment: true },
        })

        // Log audit event
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            reservationId: reservation.id,
            action: 'CREATE',
            entity: 'Reservation',
            entityId: reservation.id,
            metadata: { equipmentName: reservation.equipment.name, totalPrice: item.totalPrice },
          },
        })

        return reservation
      })
    )

    // Send confirmation email
    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: session.user.email,
      subject: `🚀 Reservation Confirmed – RentRig`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #6366f1;">Reservation Confirmed!</h1>
          <p>Hi ${session.user.name},</p>
          <p>Your reservations have been confirmed. Here's a summary:</p>
          ${reservations.map((r) => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0;">
              <h3 style="margin: 0 0 8px;">${r.equipment.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ${r.startDate.toLocaleDateString('en-IN')} – ${r.endDate.toLocaleDateString('en-IN')}
              </p>
              <p style="margin: 8px 0 0; font-weight: bold; color: #6366f1;">
                ₹${r.totalPrice.toLocaleString('en-IN')}
              </p>
            </div>
          `).join('')}
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Questions? Reply to this email or visit your dashboard.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px;">
            View Dashboard
          </a>
        </div>
      `,
    })

    // Log email event
    if (emailResult.data?.id) {
      await prisma.emailEvent.create({
        data: {
          reservationId: reservations[0]?.id,
          toEmail: session.user.email,
          subject: 'Reservation Confirmed – RentRig',
          resendId: emailResult.data.id,
          eventType: 'DELIVERED',
          metadata: { reservationCount: reservations.length },
        },
      })
    }

    return NextResponse.json({ ok: true, count: reservations.length })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
