import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import BadgesClient from './client'

export default async function BadgesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: userData }, { data: earnedBadges }] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).single(),
    supabase.from('earned_badges').select('*').eq('user_id', user.id),
  ])

  if (userData?.role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="player" userEmail={user.email}>
      <BadgesClient earnedBadges={earnedBadges ?? []} />
    </AppShell>
  )
}
