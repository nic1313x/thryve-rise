import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

const ADMIN_EMAILS = ['nic@thryvetogether.com']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!ADMIN_EMAILS.includes(user.email ?? '')) redirect('/dashboard')

  return (
    <AppShell role="admin" userEmail={user.email}>
      {children}
    </AppShell>
  )
}
