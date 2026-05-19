import { createClient } from '@/lib/supabase/server'
import AdminActivityClient from './client'

export default async function AdminActivityPage() {
  const supabase = createClient()

  const { data: rhiannon } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'rhiannon@thryvetogether.com')
    .single()

  const { data: completions } = rhiannon
    ? await supabase
        .from('completions')
        .select('*, tasks(title, phase, xp, icon)')
        .eq('user_id', rhiannon.id)
        .order('completed_at', { ascending: false })
        .limit(20)
    : { data: [] }

  return <AdminActivityClient completions={completions ?? []} rhiannonId={rhiannon?.id} />
}
