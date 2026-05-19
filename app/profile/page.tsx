import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import ProfileClient from './client'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: userData },
    { data: stats },
    { data: completions },
    { data: earnedBadges },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
    supabase.from('completions').select('id').eq('user_id', user.id),
    supabase.from('earned_badges').select('badge_id').eq('user_id', user.id),
  ])

  if (userData?.role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="player" userEmail={user.email}>
      <ProfileClient
        userEmail={user.email ?? ''}
        userData={userData}
        stats={stats}
        completionCount={completions?.length ?? 0}
        badgeCount={earnedBadges?.length ?? 0}
      />
    </AppShell>
  )
}
