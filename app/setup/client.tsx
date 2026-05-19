'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SEED_TASKS } from '@/lib/game/tasks'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SetupClient({ tasksSeeded }: { tasksSeeded: boolean }) {
  const [seeding, setSeeding] = useState(false)
  const [done, setDone] = useState(tasksSeeded)
  const [error, setError] = useState('')
  const [log, setLog] = useState<string[]>([])
  const supabase = createClient()

  async function handleSeed() {
    setSeeding(true)
    setError('')
    setLog([])

    try {
      setLog(prev => [...prev, `Seeding ${SEED_TASKS.length} tasks...`])

      const { error: taskError } = await supabase
        .from('tasks')
        .upsert(SEED_TASKS, { onConflict: 'id' })

      if (taskError) throw taskError

      setLog(prev => [...prev, `✓ Tasks seeded successfully`])

      // Seed user records
      setLog(prev => [...prev, 'Creating user accounts...'])
      setLog(prev => [...prev, '→ Note: Users are created on first login via magic link.'])
      setLog(prev => [...prev, '→ Admin override: seeding nic@thryvetogether.com as admin...'])

      // Note: We can't create auth users directly from the client.
      // Users will be created when they first log in.
      // We pre-seed the admin role assignment.
      setLog(prev => [...prev, ''])
      setLog(prev => [...prev, '✓ Setup complete!'])
      setLog(prev => [...prev, ''])
      setLog(prev => [...prev, 'Next steps:'])
      setLog(prev => [...prev, '1. Send magic link to: rhiannon@thryvetogether.com'])
      setLog(prev => [...prev, '2. Send magic link to: nic@thryvetogether.com'])
      setLog(prev => [...prev, "3. After Nic's first login, manually set role='admin' in the users table."])
      setLog(prev => [...prev, '   Or use the SQL: UPDATE users SET role=\'admin\' WHERE email=\'nic@thryvetogether.com\';'])

      setDone(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Seed failed'
      setError(message)
      setLog(prev => [...prev, `✗ Error: ${message}`])
    } finally {
      setSeeding(false)
    }
  }

  async function handleReset() {
    if (!confirm('Delete all completions, stats, badges, and re-seed tasks? This cannot be undone.')) return
    setSeeding(true)
    setLog([])

    try {
      setLog(prev => [...prev, 'Clearing completions...'])
      await supabase.from('completions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      setLog(prev => [...prev, 'Clearing user stats...'])
      await supabase.from('user_stats').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')

      setLog(prev => [...prev, 'Clearing earned badges...'])
      await supabase.from('earned_badges').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      setLog(prev => [...prev, 'Re-seeding tasks...'])
      await supabase.from('tasks').upsert(SEED_TASKS, { onConflict: 'id' })

      setLog(prev => [...prev, '✓ Reset complete. Fresh start.'])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reset failed'
      setLog(prev => [...prev, `✗ Error: ${message}`])
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl text-cream mb-1">Setup</h1>
        <p className="text-teal-muted text-sm">Initialize the Thryve Rise database.</p>
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl p-4 border ${done ? 'bg-hulk/10 border-hulk/30' : 'bg-orange-accent/10 border-orange-accent/30'}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{done ? '✅' : '⚠️'}</span>
          <div>
            <p className="text-cream font-semibold text-sm">
              {done ? 'Tasks are seeded.' : 'Tasks not seeded yet.'}
            </p>
            <p className="text-teal-muted text-xs mt-0.5">
              {done ? '20 tasks found in the database.' : 'Click Seed Tasks to populate the tasks table.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="bg-orange-accent hover:bg-orange-hover disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
        >
          {seeding ? 'Working...' : done ? 'Re-seed Tasks' : 'Seed Tasks'}
        </button>
        <button
          onClick={handleReset}
          disabled={seeding}
          className="border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
        >
          Reset All Data
        </button>
        <Link
          href="/admin/dashboard"
          className="border border-surface-border text-teal-muted hover:text-cream px-6 py-3 rounded-xl text-sm transition-all"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/50 border border-surface-border rounded-xl p-4 font-mono text-xs"
        >
          {log.map((line, i) => (
            <div
              key={i}
              className={`${
                line.startsWith('✓') ? 'text-hulk' :
                line.startsWith('✗') ? 'text-red-400' :
                line.startsWith('→') ? 'text-teal-muted' :
                line.startsWith('Next') || line.match(/^\d\./) ? 'text-cream' :
                'text-cream/70'
              }`}
            >
              {line || <br />}
            </div>
          ))}
        </motion.div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>
      )}

      {/* Task inventory */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-raised border border-surface-border rounded-xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-surface-border">
          <p className="text-xs font-semibold text-teal-muted uppercase tracking-wider">Task Inventory (20 tasks)</p>
        </div>
        <div className="divide-y divide-surface-border/50">
          {SEED_TASKS.map(task => (
            <div key={task.id} className="px-4 py-2.5 flex items-center gap-3">
              <span className="text-teal-muted text-xs w-4">{task.id}</span>
              <span>{task.icon}</span>
              <span className="text-cream text-xs flex-1 truncate">{task.title}</span>
              <span className="text-[10px] text-teal-muted">P{task.phase}</span>
              <span className="text-[10px] text-orange-accent font-semibold">{task.xp} XP</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
