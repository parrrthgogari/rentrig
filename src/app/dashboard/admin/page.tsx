import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { User, AuditLog, EmailEvent } from '@prisma/client'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Panel' }

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [users, auditLogs, emailEvents, equipment] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.emailEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.equipment.count(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Equipment Items', value: equipment },
            { label: 'Audit Events', value: auditLogs.length },
            { label: 'Email Events', value: emailEvents.length },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audit Logs */}
          <Card>
            <CardHeader><CardTitle>Recent Audit Logs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log: AuditLog & { user: { name: string | null } | null }) => (
                  <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground mx-1">on</span>
                      <span className="font-medium">{log.entity}</span>
                      {log.user && (
                        <span className="text-muted-foreground"> by {log.user.name}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Delivery Events */}
          <Card>
            <CardHeader><CardTitle>Email Delivery Events</CardTitle></CardHeader>
            <CardContent>
              {emailEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No webhook events yet.</p>
              ) : (
                <div className="space-y-3">
                  {emailEvents.map((event: EmailEvent) => (
                    <div key={event.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{event.subject}</p>
                        <p className="text-muted-foreground text-xs">{event.toEmail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            event.eventType === 'DELIVERED' ? 'success' :
                            event.eventType === 'BOUNCED' ? 'destructive' : 'secondary'
                          }
                        >
                          {event.eventType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mt-8">
          <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Role</th>
                    <th className="text-left py-3 px-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{user.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-2">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'MEMBER' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
