'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { UserStats, Task } from '@/types'
import { getLevelForXp } from '@/lib/game/xp'
import { formatRelativeTime, formatDate } from '@/lib/utils'

interface Props {
  rhiannon: { id: string; email: string; created_at: string } | null
  stats: UserStats | null
  completions: { id: string; task_id: number; completed_at: string; tasks?: { title: string; phase: number; xp: number; icon: string } }[]
  tasks: Task[]
  earnedBadges: { badge_id: string }[]
}

export default function AdminDashboardClient({ rhiannon, stats: initialStats, completions: initialCompletions, tasks, earnedBadges }: Props) {
  const [stats, setStats] = useState<UserStats | null>(initialStats)
  const [completions, setCompletions] = useState(initialCompletions)
  const supabase = createClient()

  const totalXp = stats?.total_xp ?? 0
  const level = getLevelForXp(totalXp)
  const percentComplete = Math.round((completions.length / 20) * 100)
  const daysSinceActive = stats?.last_active
    ? Math.floor((Date.now() - new Date(stats.last_active).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isInactive = daysSinceActive !== null && daysSinceActive >= 7

  // Realtime subscription
  useEffect(() => {
    if (!rhiannon) return

    const channel = supabase
      .channel('admin-completions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completions',
          filter: `user_id=eq.${rhiannon.id}`,
        },
        async (payload) => {
          const newCompletion = payload.new as { id: string; task_id: number; completed_at: string }
          const task = tasks.find(t => t.id === newCompletion.task_id)
          setCompletions(prev => [
            { ...newCompletion, tasks: task ? { title: task.title, phase: task.phase, xp: task.xp, icon: task.icon } : undefined },
            ...prev,
          ])

          // Refresh stats
          const { data } = await supabase.from('user_stats').select('*').eq('user_id', rhiannon.id).single()
          if (data) setStats(data)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [rhiannon, tasks, supabase])

  if (!rhiannon) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-4xl text-cream">Admin Dashboard</h1>
        <div className="bg-surface-raised border border-orange-accent/30 rounded-xl p-6 text-center">
          <p className="text-cream font-medium mb-2">Rhiannon hasn't logged in yet</p>
          <p className="text-teal-muted text-sm">Once she signs in via magic link, her data will appear here.</p>
          <p className="text-teal-muted text-xs mt-3">Make sure the tasks table is seeded — go to <a href="/setup" className="underline hover:text-cream">/setup</a></p>
        </div>
      </div>
    )
  }

  const phase1Done = [1,2,3,4,5].every(id => completions.some(c => c.task_id === id))
  const phase2Done = [6,7,8,9,10].every(id => completions.some(c => c.task_id === id))
  const phase3Done = [11,12,13,14,15].every(id => completions.some(c => c.task_id === id))
  const currentPhase = phase3Done ? 4 : phase2Done ? 3 : phase1Done ? 2 : 1

  const phaseNames = ['Build the Foundation', 'Build the Systems', 'Build the Growth Engine', 'Lead the Company']

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-4xl text-cream mb-1">Admin Overview</h1>
            <p className="text-teal-muted text-sm">Watching Rhiannon's progress in real time.</p>
          </div>
          {/* Realtime indicator */}
          <div className="flex items-center gap-2 bg-hulk/10 border border-hulk/20 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-hulk animate-pulse" />
            <span className="text-xs text-hulk font-medium">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Inactive alert */}
      {isInactive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-accent/10 border border-orange-accent/30 rounded-xl p-4 flex items-center gap-3"
        >
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-cream">
            Rhiannon hasn't logged in for <span className="font-bold text-orange-accent">{daysSinceActive} days</span>. Consider a check-in.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { icon: '⚡', label: 'Total XP', value: `${totalXp.toLocaleString()} XP` },
          { icon: '🎯', label: 'Level', value: `${level.level} — ${level.title}` },
          { icon: '✅', label: 'Tasks Done', value: `${completions.length}/20` },
          { icon: '📊', label: 'Completion', value: `${percentComplete}%` },
          { icon: '🗺️', label: 'Current Phase', value: `Phase ${currentPhase}` },
          { icon: '🔥', label: 'Streak', value: `${stats?.current_streak ?? 0} days` },
          { icon: '🏅', label: 'Badges', value: `${earnedBadges.length}/11` },
          { icon: '🕐', label: 'Last Active', value: stats?.last_active ? formatRelativeTime(stats.last_active) : '—' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-surface-raised border border-surface-border rounded-xl p-4"
          >
            <p className="text-lg mb-1">{stat.icon}</p>
            <p className="font-bold text-cream text-sm leading-tight">{stat.value}</p>
            <p className="text-[11px] text-teal-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-raised border border-surface-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-teal-muted uppercase tracking-wider font-medium">Overall Progress</p>
            <p className="text-sm text-cream mt-0.5">Phase {currentPhase}: {phaseNames[currentPhase - 1]}</p>
          </div>
          <span className="font-serif text-3xl text-cream">{percentComplete}%</span>
        </div>
        <div className="h-3 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-accent to-hulk rounded-full"
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-teal-muted mt-1.5">
          <span>{completions.length} tasks complete</span>
          <span>{20 - completions.length} remaining</span>
        </div>
      </motion.div>

      {/* Recent completions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-surface-raised border border-surface-border rounded-xl p-5"
      >
        <p className="text-xs text-teal-muted uppercase tracking-wider font-medium mb-4">Recent Activity</p>
        {completions.length === 0 ? (
          <p className="text-teal-muted text-sm">No tasks completed yet.</p>
        ) : (
          <div className="space-y-3">
            {completions.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-lg">{c.tasks?.icon ?? '✅'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cream font-medium truncate">{c.tasks?.title ?? `Task ${c.task_id}`}</p>
                  <p className="text-[11px] text-teal-muted">Phase {c.tasks?.phase} · +{c.tasks?.xp} XP</p>
                </div>
                <p className="text-xs text-teal-muted flex-shrink-0">{formatRelativeTime(c.completed_at)}</p>
              </div>
            ))}
            {completions.length > 5 && (
              <a href="/admin/activity" className="text-xs text-teal-muted underline hover:text-cream transition-colors">
                View all {completions.length} completions →
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
