import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    const eventTypeMap: Record<string, string> = {
      'email.delivered': 'DELIVERED',
      'email.bounced': 'BOUNCED',
      'email.opened': 'OPENED',
      'email.clicked': 'CLICKED',
      'email.complained': 'COMPLAINED',
    }

    const eventType = eventTypeMap[type]
    if (!eventType) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    await prisma.emailEvent.create({
      data: {
        toEmail: data?.to?.[0] || 'unknown',
        subject: data?.subject || 'Unknown',
        resendId: data?.email_id,
        eventType: eventType as never,
        metadata: body,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
