import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['nic@thryvetogether.com']

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  if (ADMIN_EMAILS.includes(user.email ?? '')) redirect('/admin/dashboard')
  redirect('/dashboard')
}
