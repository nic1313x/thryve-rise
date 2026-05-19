'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDateTime } from '@/lib/utils'

interface Completion {
  id: string
  task_id: number
  completed_at: string
  tasks?: { title: string; phase: number; xp: number; icon: string }
}

interface Props {
  completions: Completion[]
  rhiannonId?: string
}

export default function AdminActivityClient({ completions: initial, rhiannonId }: Props) {
  const [completions, setCompletions] = useState<Completion[]>(initial)
  const supabase = createClient()

  useEffect(() => {
    if (!rhiannonId) return

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completions',
          filter: `user_id=eq.${rhiannonId}`,
        },
        async (payload) => {
          const newC = payload.new as Completion
          // Fetch task details
          const { data: task } = await supabase
            .from('tasks')
            .select('title, phase, xp, icon')
            .eq('id', newC.task_id)
            .single()

          setCompletions(prev => [{ ...newC, tasks: task ?? undefined }, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [rhiannonId, supabase])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl text-cream mb-1">Activity Feed</h1>
            <p className="text-teal-muted text-sm">Last 20 completions — live updates enabled</p>
          </div>
          <div className="flex items-center gap-2 bg-hulk/10 border border-hulk/20 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-hulk animate-pulse" />
            <span className="text-xs text-hulk font-medium">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Feed */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {completions.length === 0 ? (
            <div className="bg-surface-raised border border-surface-border rounded-xl p-8 text-center">
              <p className="text-teal-muted">No activity yet. Waiting for Rhiannon to complete her first task.</p>
            </div>
          ) : (
            completions.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-surface-raised border border-surface-border hover:border-orange-accent/20 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{c.tasks?.icon ?? '✅'}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cream font-medium truncate">
                      {c.tasks?.title ?? `Task ${c.task_id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {c.tasks?.phase && (
                        <span className="text-[10px] bg-surface-elevated text-teal-muted px-2 py-0.5 rounded-full">
                          Phase {c.tasks.phase}
                        </span>
                      )}
                      {c.tasks?.xp && (
                        <span className="text-[10px] text-orange-accent font-semibold">
                          +{c.tasks.xp} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-cream font-medium">{formatRelativeTime(c.completed_at)}</p>
                    <p className="text-[10px] text-teal-muted mt-0.5 hidden sm:block">
                      {formatDateTime(c.completed_at)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
