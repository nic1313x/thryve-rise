import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import DashboardClient from './client'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: userData },
    { data: stats },
    { data: tasks },
    { data: completions },
    { data: earnedBadges },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
    supabase.from('tasks').select('*').order('id'),
    supabase.from('completions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
    supabase.from('earned_badges').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }),
  ])

  if (userData?.role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="player" userEmail={user.email}>
      <DashboardClient
        userId={user.id}
        userEmail={user.email ?? ''}
        stats={stats}
        tasks={tasks ?? []}
        completions={completions ?? []}
        earnedBadges={earnedBadges ?? []}
      />
    </AppShell>
  )
}
