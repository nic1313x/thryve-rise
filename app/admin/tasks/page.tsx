import { createClient } from '@/lib/supabase/server'
import AdminTasksClient from './client'

export default async function AdminTasksPage() {
  const supabase = createClient()

  const { data: rhiannon } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'rhiannon@thryvetogether.com')
    .single()

  const [{ data: tasks }, { data: completions }] = await Promise.all([
    supabase.from('tasks').select('*').order('id'),
    rhiannon
      ? supabase.from('completions').select('task_id, completed_at').eq('user_id', rhiannon.id)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <AdminTasksClient
      tasks={tasks ?? []}
      completions={completions ?? []}
    />
  )
}
