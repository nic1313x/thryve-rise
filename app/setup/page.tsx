import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SetupClient from './client'

const ADMIN_EMAILS = ['nic@thryvetogether.com']

export default async function SetupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!ADMIN_EMAILS.includes(user.email ?? '')) redirect('/dashboard')

  const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true })

  return <SetupClient tasksSeeded={(count ?? 0) > 0} />
}
