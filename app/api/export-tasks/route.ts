import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('id')

  const { data: completions } = await supabase
    .from('completions')
    .select('task_id, completed_at')

  const completionMap = new Map<number, string>()
  completions?.forEach((c: { task_id: number; completed_at: string }) => {
    completionMap.set(c.task_id, c.completed_at)
  })

  const rows = tasks?.map(t => ({
    id: t.id,
    phase: t.phase,
    title: t.title,
    xp: t.xp,
    impact: t.impact_label,
    status: completionMap.has(t.id) ? 'Complete' : 'Incomplete',
    completed_at: completionMap.get(t.id) ?? '',
  })) ?? []

  const header = 'ID,Phase,Title,XP,Impact,Status,Completed At\n'
  const csv = header + rows.map(r =>
    `${r.id},${r.phase},"${r.title.replace(/"/g, '""')}",${r.xp},"${r.impact}",${r.status},"${r.completed_at}"`
  ).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="thryve-rise-tasks.csv"',
    },
  })
}
