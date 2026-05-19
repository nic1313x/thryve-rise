'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Task, Completion, UserStats } from '@/types'
import { getLevelForXp, getXpProgress, TOTAL_XP } from '@/lib/game/xp'
import { getBadgeById, BADGE_DEFINITIONS } from '@/lib/game/badges'
import { getRandomToastMessage, shouldShowHulkSuffix, shouldShowConfetti } from '@/lib/game/messages'
import { PHASE_META } from '@/lib/game/tasks'
import { useToast } from '@/contexts/toast'
import XPBar from '@/components/game/XPBar'
import LevelBadge from '@/components/game/LevelBadge'
import StreakCounter from '@/components/game/StreakCounter'
import LevelUpModal from '@/components/game/LevelUpModal'
import WatchDisplay from '@/components/game/WatchDisplay'
import WinScreen from '@/components/game/WinScreen'
import Confetti from '@/components/game/Confetti'
import { Skeleton } from '@/components/ui/skeleton'
import type { LevelInfo } from '@/types'

interface Props {
  userId: string
  userEmail: string
  stats: UserStats | null
  tasks: Task[]
  completions: Completion[]
  earnedBadges: { badge_id: string; earned_at: string }[]
}

export default function DashboardClient({ userId, userEmail, stats: initialStats, tasks, completions: initialCompletions, earnedBadges: initialBadges }: Props) {
  const [stats, setStats] = useState<UserStats | null>(initialStats)
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(initialCompletions.map(c => c.task_id))
  )
  const [levelUpInfo, setLevelUpInfo] = useState<LevelInfo | null>(null)
  const [confetti, setConfetti] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState(initialBadges)
  const { showToast } = useToast()

  const firstName = userEmail.split('@')[0].split('.')[0]
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const totalXp = stats?.total_xp ?? 0
  const level = getLevelForXp(totalXp)
  const xpProgress = getXpProgress(totalXp)
  const percentComplete = Math.round((completedIds.size / 20) * 100)

  const phase1Done = [1,2,3,4,5].every(id => completedIds.has(id))
  const phase2Done = [6,7,8,9,10].every(id => completedIds.has(id))
  const phase3Done = [11,12,13,14,15].every(id => completedIds.has(id))

  const currentPhaseIndex = phase3Done ? 3 : phase2Done ? 2 : phase1Done ? 1 : 0
  const currentPhaseMeta = PHASE_META[currentPhaseIndex]
  const phaseTaskIds = [
    [1,2,3,4,5], [6,7,8,9,10], [11,12,13,14,15], [16,17,18,19,20]
  ][currentPhaseIndex]
  const phaseCompleted = phaseTaskIds.filter(id => completedIds.has(id)).length

  const nextTask = tasks.find(t => !completedIds.has(t.id))
  const recentBadges = earnedBadges.slice(0, 3).map(eb => getBadgeById(eb.badge_id)).filter(Boolean)

  const handleComplete = useCallback(async (taskId: number) => {
    const res = await fetch('/api/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId }),
    })
    const data = await res.json()
    if (!data.success) return

    setCompletedIds(prev => new Set([...prev, taskId]))
    if (data.newStats) setStats(data.newStats)

    // Toast
    const addHulk = shouldShowHulkSuffix()
    showToast(getRandomToastMessage(addHulk), { type: 'success' })

    // Badge toasts
    data.newBadges?.forEach((badge: { id: string; icon: string; name: string; description: string }) => {
      setTimeout(() => {
        showToast(badge.name, { type: 'badge', icon: badge.icon, subtitle: badge.description })
      }, 800)
      setEarnedBadges(prev => [{ badge_id: badge.id, earned_at: new Date().toISOString() }, ...prev])
    })

    // Confetti
    if (shouldShowConfetti()) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 100)
    }

    // Level up
    if (data.levelUp) {
      setTimeout(() => setLevelUpInfo(data.levelUp), 600)
    }

    // Win screen
    if (completedIds.size + 1 === 20) {
      setTimeout(() => setShowWin(true), 2000)
    }
  }, [completedIds, showToast])

  const greetings = ['Welcome back', 'Good to see you', 'Back at it']
  const greeting = greetings[new Date().getHours() % greetings.length]

  if (showWin) {
    return <WinScreen isVisible={true} totalXp={totalXp} tasksCompleted={completedIds.size} />
  }

  return (
    <>
      <LevelUpModal levelInfo={levelUpInfo} onDismiss={() => setLevelUpInfo(null)} />
      <Confetti trigger={confetti} />

      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-teal-muted text-sm">{greeting},</p>
          <h1 className="font-serif text-4xl text-cream mt-1">{displayName}</h1>
          <LevelBadge xp={totalXp} size="sm" />
        </motion.div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-raised border border-surface-border rounded-xl p-5"
        >
          <XPBar xp={totalXp} />
        </motion.div>

        {/* Quick stats grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Total XP', value: totalXp.toLocaleString(), icon: '⚡' },
            { label: 'Tasks Done', value: `${completedIds.size}/20`, icon: '✅' },
            { label: 'Level', value: level.title, icon: '🎯' },
            { label: 'Phase', value: currentPhaseMeta.name.split(' ').slice(-1)[0], icon: '🗺️' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-surface-raised border border-surface-border rounded-xl p-4"
            >
              <p className="text-xl mb-1">{stat.icon}</p>
              <p className="font-bold text-cream text-base leading-tight">{stat.value}</p>
              <p className="text-[11px] text-teal-muted mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main content - 2 cols on desktop */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left col */}
          <div className="space-y-5">
            {/* Streak */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <StreakCounter
                current={stats?.current_streak ?? 0}
                best={stats?.best_streak ?? 0}
              />
            </motion.div>

            {/* Current phase */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-surface-raised border border-surface-border rounded-xl p-5"
            >
              <p className="text-xs text-teal-muted uppercase tracking-wider font-medium mb-3">Current Phase</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-cream font-semibold text-sm">Phase {currentPhaseIndex + 1}: {currentPhaseMeta.name}</p>
                  <p className="text-teal-muted text-xs mt-0.5 italic">"{currentPhaseMeta.tagline}"</p>
                </div>
                <span className="text-xs font-bold text-orange-accent bg-orange-accent/10 px-2 py-1 rounded-full">
                  {phaseCompleted}/{phaseTaskIds.length}
                </span>
              </div>
              <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-accent rounded-full"
                  animate={{ width: `${(phaseCompleted / phaseTaskIds.length) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>

            {/* Next task CTA */}
            {nextTask && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-surface-raised border border-orange-accent/20 rounded-xl p-5"
              >
                <p className="text-xs text-teal-muted uppercase tracking-wider font-medium mb-3">Up Next</p>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{nextTask.icon}</span>
                  <div>
                    <p className="text-cream font-semibold text-sm">{nextTask.title}</p>
                    <p className="text-teal-muted text-xs mt-1 line-clamp-2">{nextTask.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-orange-accent font-semibold bg-orange-accent/10 px-2 py-0.5 rounded-full">
                        +{nextTask.xp} XP
                      </span>
                      <a href="/roadmap" className="text-[10px] text-teal-muted underline hover:text-cream transition-colors">
                        View in Roadmap →
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Watch display */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <WatchDisplay percentComplete={percentComplete} />
            </motion.div>

            {/* Recent badges */}
            {recentBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-surface-raised border border-surface-border rounded-xl p-5"
              >
                <p className="text-xs text-teal-muted uppercase tracking-wider font-medium mb-3">Recent Badges</p>
                <div className="space-y-2">
                  {recentBadges.map((badge, i) => badge && (
                    <div key={badge.id} className="flex items-center gap-3">
                      <span className="text-xl">{badge.icon}</span>
                      <div>
                        <p className="text-sm text-cream font-medium">{badge.name}</p>
                        <p className="text-[11px] text-teal-muted">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="/badges" className="text-xs text-teal-muted underline hover:text-cream mt-3 block transition-colors">
                  View all badges →
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-surface-raised border border-surface-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-teal-muted uppercase tracking-wider font-medium">Overall Progress</p>
            <span className="text-sm font-bold text-cream">{percentComplete}%</span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-accent to-hulk rounded-full"
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-teal-muted mt-2">{completedIds.size} of 20 tasks complete</p>
        </motion.div>
      </div>
    </>
  )
}
