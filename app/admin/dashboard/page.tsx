import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './client'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Get Rhiannon's data
  const { data: rhiannon } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'rhiannon@thryvetogether.com')
    .single()

  const [
    { data: stats },
    { data: completions },
    { data: tasks },
    { data: earnedBadges },
  ] = await Promise.all([
    rhiannon ? supabase.from('user_stats').select('*').eq('user_id', rhiannon.id).single() : Promise.resolve({ data: null }),
    rhiannon ? supabase.from('completions').select('*, tasks(title, phase, xp, icon)').eq('user_id', rhiannon.id).order('completed_at', { ascending: false }) : Promise.resolve({ data: [] }),
    supabase.from('tasks').select('*').order('id'),
    rhiannon ? supabase.from('earned_badges').select('*').eq('user_id', rhiannon.id) : Promise.resolve({ data: [] }),
  ])

  return (
    <AdminDashboardClient
      rhiannon={rhiannon}
      stats={stats}
      completions={completions ?? []}
      tasks={tasks ?? []}
      earnedBadges={earnedBadges ?? []}
    />
  )
}
