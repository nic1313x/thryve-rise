import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getLevelForXp, didLevelUp } from '@/lib/game/xp'
import { checkNewBadges } from '@/lib/game/badges'

export async function POST(request: NextRequest) {
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

  const { task_id } = await request.json()
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 })

  // Check if already completed
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_id', task_id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already completed' }, { status: 409 })

  // Get task XP
  const { data: task } = await supabase
    .from('tasks')
    .select('xp, phase')
    .eq('id', task_id)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  // Get current stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const oldXp = stats?.total_xp ?? 0
  const newXp = oldXp + task.xp

  // Insert completion
  const now = new Date()
  await supabase.from('completions').insert({
    user_id: user.id,
    task_id,
    completed_at: now.toISOString(),
  })

  // Streak logic
  const lastDate = stats?.last_completion_date
  let currentStreak = stats?.current_streak ?? 0
  let bestStreak = stats?.best_streak ?? 0
  const today = now.toISOString().split('T')[0]

  if (lastDate) {
    const last = new Date(lastDate)
    const diffMs = now.getTime() - last.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    if (today === lastDate) {
      // Same day, no streak change
    } else if (diffHours <= 48) {
      currentStreak += 1
    } else {
      currentStreak = 1
    }
  } else {
    currentStreak = 1
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak

  // Determine current phase
  const { data: completions } = await supabase
    .from('completions')
    .select('task_id, tasks(phase)')
    .eq('user_id', user.id)

  const completedTaskIds = completions?.map((c: { task_id: number }) => c.task_id) ?? []
  completedTaskIds.push(task_id)

  const phase1Done = [1, 2, 3, 4, 5].every(id => completedTaskIds.includes(id))
  const phase2Done = [6, 7, 8, 9, 10].every(id => completedTaskIds.includes(id))
  const phase3Done = [11, 12, 13, 14, 15].every(id => completedTaskIds.includes(id))
  let currentPhase = 1
  if (phase1Done) currentPhase = 2
  if (phase2Done) currentPhase = 3
  if (phase3Done) currentPhase = 4

  const newLevel = getLevelForXp(newXp)
  const levelUp = didLevelUp(oldXp, newXp)

  // Update user_stats
  const { data: newStats } = await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      total_xp: newXp,
      level: newLevel.level,
      last_active: now.toISOString(),
      current_phase: currentPhase,
      current_streak: currentStreak,
      best_streak: bestStreak,
      last_completion_date: today,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  // Check badge unlocks
  const { data: earnedBadges } = await supabase
    .from('earned_badges')
    .select('badge_id')
    .eq('user_id', user.id)

  const earnedIds = earnedBadges?.map((b: { badge_id: string }) => b.badge_id) ?? []
  const newBadges = checkNewBadges(completedTaskIds, newXp, earnedIds)

  if (newBadges.length > 0) {
    await supabase.from('earned_badges').insert(
      newBadges.map(b => ({
        user_id: user.id,
        badge_id: b.id,
        earned_at: now.toISOString(),
      }))
    )
  }

  // Notify on final task completion
  if (completedTaskIds.length === 20) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ user_id: user.id, total_xp: newXp }),
      })
    } catch {
      // Non-blocking — notification failure shouldn't fail the completion
    }
  }

  return NextResponse.json({
    success: true,
    newStats,
    levelUp,
    newBadges,
    xpEarned: task.xp,
  })
}
