import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { AppShell } from './_components/AppShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/login')
  }

  const u = user as { email?: string; name?: string; role?: string }

  return (
    <AppShell
      userEmail={u.email ?? ''}
      userName={u.name ?? u.email ?? ''}
      role={u.role ?? 'admin'}
    >
      {children}
    </AppShell>
  )
}
