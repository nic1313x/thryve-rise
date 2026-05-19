'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface Props {
  tasks: Task[]
  completions: { task_id: number; completed_at: string }[]
}

type SortKey = 'id' | 'phase' | 'status' | 'completed_at'
type SortDir = 'asc' | 'desc'

export default function AdminTasksClient({ tasks, completions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filterPhase, setFilterPhase] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all')

  const completionMap = new Map(completions.map(c => [c.task_id, c.completed_at]))

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = tasks
    .filter(t => filterPhase ? t.phase === filterPhase : true)
    .filter(t => {
      if (filterStatus === 'complete') return completionMap.has(t.id)
      if (filterStatus === 'incomplete') return !completionMap.has(t.id)
      return true
    })
    .sort((a, b) => {
      let aVal: string | number = 0
      let bVal: string | number = 0

      if (sortKey === 'id') { aVal = a.id; bVal = b.id }
      else if (sortKey === 'phase') { aVal = a.phase; bVal = b.phase }
      else if (sortKey === 'status') {
        aVal = completionMap.has(a.id) ? 1 : 0
        bVal = completionMap.has(b.id) ? 1 : 0
      }
      else if (sortKey === 'completed_at') {
        aVal = completionMap.get(a.id) ?? ''
        bVal = completionMap.get(b.id) ?? ''
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const completeCount = completions.length
  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  async function handleExport() {
    const res = await fetch('/api/export-tasks')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'thryve-rise-tasks.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="font-serif text-4xl text-cream mb-1">Task List</h1>
          <p className="text-teal-muted text-sm">{completeCount} of 20 complete</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-surface-raised border border-surface-border hover:border-orange-accent/40 text-cream text-sm px-4 py-2 rounded-xl transition-all"
        >
          Export CSV ↓
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {/* Phase filter */}
        {[null, 1, 2, 3, 4].map(phase => (
          <button
            key={phase ?? 'all'}
            onClick={() => setFilterPhase(phase)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filterPhase === phase
                ? 'bg-orange-accent border-orange-accent text-white'
                : 'border-surface-border text-teal-muted hover:text-cream'
            }`}
          >
            {phase === null ? 'All Phases' : `Phase ${phase}`}
          </button>
        ))}
        <div className="w-px bg-surface-border mx-1" />
        {(['all', 'complete', 'incomplete'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filterStatus === s
                ? 'bg-teal-light border-teal-light text-cream'
                : 'border-surface-border text-teal-muted hover:text-cream'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-surface-raised border border-surface-border rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {[
                  { key: 'id' as SortKey, label: '#' },
                  { key: 'phase' as SortKey, label: 'Phase' },
                  { key: 'id' as SortKey, label: 'Task', noSort: true },
                  { key: 'id' as SortKey, label: 'XP', noSort: true },
                  { key: 'status' as SortKey, label: 'Status' },
                  { key: 'completed_at' as SortKey, label: 'Completed' },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => !col.noSort && handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-teal-muted uppercase tracking-wider ${!col.noSort ? 'cursor-pointer hover:text-cream' : ''}`}
                  >
                    {col.label}{!col.noSort && sortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => {
                const complete = completionMap.has(task.id)
                const completedAt = completionMap.get(task.id)

                return (
                  <tr
                    key={task.id}
                    className={`border-b border-surface-border/50 transition-colors ${
                      complete ? 'bg-orange-accent/5' : 'hover:bg-surface-elevated/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-teal-muted text-xs">{task.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-surface-elevated text-teal-muted px-2 py-0.5 rounded-full">
                        P{task.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span>{task.icon}</span>
                        <span className={`text-xs font-medium ${complete ? 'line-through text-teal-muted' : 'text-cream'}`}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-orange-accent font-semibold">{task.xp} XP</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        complete
                          ? 'bg-hulk/10 text-hulk border border-hulk/20'
                          : 'bg-surface-elevated text-teal-muted border border-surface-border'
                      }`}>
                        {complete ? '✓ Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-teal-muted">
                      {completedAt ? formatDateTime(completedAt) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-surface-border">
          <p className="text-xs text-teal-muted">Showing {filtered.length} of {tasks.length} tasks</p>
        </div>
      </motion.div>
    </div>
  )
}
