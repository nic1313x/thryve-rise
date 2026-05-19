import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import RoadmapClient from './client'

export default async function RoadmapPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: userData },
    { data: tasks },
    { data: completions },
  ] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).single(),
    supabase.from('tasks').select('*').order('id'),
    supabase.from('completions').select('*').eq('user_id', user.id),
  ])

  if (userData?.role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="player" userEmail={user.email}>
      <RoadmapClient
        userId={user.id}
        tasks={tasks ?? []}
        completions={completions ?? []}
      />
    </AppShell>
  )
}
