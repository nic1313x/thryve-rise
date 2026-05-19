'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Task, Completion } from '@/types'
import { PHASE_META } from '@/lib/game/tasks'
import { getRandomToastMessage, shouldShowHulkSuffix, shouldShowConfetti } from '@/lib/game/messages'
import { useToast } from '@/contexts/toast'
import TaskCard from '@/components/game/TaskCard'
import LevelUpModal from '@/components/game/LevelUpModal'
import PhaseCompleteModal from '@/components/game/PhaseCompleteModal'
import WinScreen from '@/components/game/WinScreen'
import Confetti from '@/components/game/Confetti'
import WatchDisplay from '@/components/game/WatchDisplay'
import type { LevelInfo } from '@/types'

interface Props {
  userId: string
  tasks: Task[]
  completions: Completion[]
}

const phaseTaskMap = [
  [1,2,3,4,5],
  [6,7,8,9,10],
  [11,12,13,14,15],
  [16,17,18,19,20],
]

export default function RoadmapClient({ userId, tasks, completions: initialCompletions }: Props) {
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions)
  const [levelUpInfo, setLevelUpInfo] = useState<LevelInfo | null>(null)
  const [phaseComplete, setPhaseComplete] = useState<number | null>(null)
  const [confetti, setConfetti] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [totalXp, setTotalXp] = useState(
    initialCompletions.reduce((acc, c) => {
      const t = tasks.find(t => t.id === c.task_id)
      return acc + (t?.xp ?? 0)
    }, 0)
  )
  const { showToast } = useToast()

  const completedIds = new Set(completions.map(c => c.task_id))
  const percentComplete = Math.round((completedIds.size / 20) * 100)

  const isPhaseComplete = (phase: number) => phaseTaskMap[phase - 1].every(id => completedIds.has(id))
  const isPhaseUnlocked = (phase: number) => {
    if (phase === 1) return true
    return phaseTaskMap[phase - 2].every(id => completedIds.has(id))
  }

  const handleComplete = useCallback(async (taskId: number) => {
    const res = await fetch('/api/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId }),
    })
    const data = await res.json()
    if (!data.success) return

    const now = new Date().toISOString()
    const task = tasks.find(t => t.id === taskId)

    setCompletions(prev => [...prev, { id: crypto.randomUUID(), user_id: userId, task_id: taskId, completed_at: now }])
    if (task) setTotalXp(prev => prev + task.xp)

    const addHulk = shouldShowHulkSuffix()
    showToast(getRandomToastMessage(addHulk))

    data.newBadges?.forEach((badge: { icon: string; name: string; description: string }) => {
      setTimeout(() => {
        showToast(badge.name, { type: 'badge', icon: badge.icon, subtitle: badge.description })
      }, 800)
    })

    if (shouldShowConfetti()) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 100)
    }

    if (data.levelUp) {
      setTimeout(() => setLevelUpInfo(data.levelUp), 600)
    }

    // Check phase completion
    const task_phase = task?.phase ?? 0
    const phaseIds = phaseTaskMap[task_phase - 1] ?? []
    const newCompletedIds = new Set([...completedIds, taskId])
    const justCompletedPhase = phaseIds.every(id => newCompletedIds.has(id))

    if (justCompletedPhase) {
      setTimeout(() => setPhaseComplete(task_phase), 800)
    }

    if (newCompletedIds.size === 20) {
      setTimeout(() => setShowWin(true), 2500)
    }
  }, [completedIds, tasks, userId, showToast])

  if (showWin) {
    return <WinScreen isVisible={true} totalXp={totalXp} tasksCompleted={completedIds.size} />
  }

  return (
    <>
      <LevelUpModal levelInfo={levelUpInfo} onDismiss={() => setLevelUpInfo(null)} />
      <PhaseCompleteModal phase={phaseComplete} onDismiss={() => setPhaseComplete(null)} />
      <Confetti trigger={confetti} />

      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl text-cream mb-1">Your Roadmap</h1>
          <p className="text-teal-muted text-sm">12 months. 4 phases. One company built.</p>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-raised border border-surface-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-teal-muted uppercase tracking-wider font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-cream">{completedIds.size}/20 tasks · {percentComplete}%</span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-accent to-hulk rounded-full"
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Phases */}
        {PHASE_META.map((meta, phaseIdx) => {
          const phase = meta.phase
          const phaseTasks = tasks.filter(t => t.phase === phase)
          const phaseCompletedCount = phaseTasks.filter(t => completedIds.has(t.id)).length
          const phasePercent = Math.round((phaseCompletedCount / phaseTasks.length) * 100)
          const unlocked = isPhaseUnlocked(phase)
          const completed = isPhaseComplete(phase)

          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + phaseIdx * 0.08 }}
              className={`relative ${!unlocked ? 'opacity-60' : ''}`}
            >
              {/* Phase header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {!unlocked && <span className="text-sm">🔒</span>}
                    {completed && <span className="text-sm">✅</span>}
                    <h2 className="font-serif text-xl text-cream">
                      Phase {phase}: {meta.name}
                    </h2>
                  </div>
                  <p className="text-teal-muted text-xs italic ml-0">"{meta.tagline}"</p>
                  <p className="text-teal-muted/60 text-[11px] mt-0.5">{meta.months}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className={`text-sm font-bold ${completed ? 'text-hulk' : 'text-orange-accent'}`}>
                    {phaseCompletedCount}/{phaseTasks.length}
                  </span>
                  <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden mt-1">
                    <motion.div
                      className={`h-full rounded-full ${completed ? 'bg-hulk' : 'bg-orange-accent'}`}
                      animate={{ width: `${phasePercent}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className={`space-y-3 ${!unlocked ? 'pointer-events-none' : ''}`}>
                {phaseTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={completedIds.has(task.id)}
                    isLocked={!unlocked}
                    onComplete={handleComplete}
                    completedAt={completions.find(c => c.task_id === task.id)?.completed_at}
                  />
                ))}
              </div>

              {/* Divider between phases */}
              {phaseIdx < 3 && (
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-surface-border" />
                  <span className="text-teal-muted text-xs">
                    {!isPhaseUnlocked(phase + 1) ? '🔒 Complete Phase ' + phase + ' to unlock' : ''}
                  </span>
                  <div className="flex-1 h-px bg-surface-border" />
                </div>
              )}
            </motion.div>
          )
        })}

        {/* The finish line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <p className="text-center text-teal-muted text-xs uppercase tracking-widest mb-4 font-medium">
            The Finish Line
          </p>
          <WatchDisplay percentComplete={percentComplete} />
          <p className="text-center text-teal-muted text-xs mt-3 italic">
            "This is what the finish line looks like."
          </p>
        </motion.div>
      </div>
    </>
  )
}
