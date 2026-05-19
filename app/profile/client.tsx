'use client'

import { motion } from 'framer-motion'
import type { UserStats } from '@/types'
import { getLevelForXp, getXpProgress, TOTAL_XP } from '@/lib/game/xp'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import XPBar from '@/components/game/XPBar'
import StreakCounter from '@/components/game/StreakCounter'
import WatchDisplay from '@/components/game/WatchDisplay'

interface Props {
  userEmail: string
  userData: { created_at: string } | null
  stats: UserStats | null
  completionCount: number
  badgeCount: number
}

export default function ProfileClient({ userEmail, userData, stats, completionCount, badgeCount }: Props) {
  const totalXp = stats?.total_xp ?? 0
  const level = getLevelForXp(totalXp)
  const percentComplete = Math.round((completionCount / 20) * 100)
  const overallPercent = Math.round((totalXp / TOTAL_XP) * 100)

  const firstName = userEmail.split('@')[0].split('.')[0]
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl text-cream mb-1">Profile</h1>
        <p className="text-teal-muted text-sm">{userEmail}</p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-raised border border-surface-border rounded-2xl p-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-teal-primary border-2 border-orange-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-2xl text-cream">{displayName[0]}</span>
          </div>

          <div className="flex-1">
            <h2 className="font-serif text-2xl text-cream">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-semibold text-orange-accent bg-orange-accent/10 px-2.5 py-0.5 rounded-full border border-orange-accent/20">
                Level {level.level} · {level.title}
              </span>
            </div>

            {/* Progress ring */}
            <div className="flex items-center gap-4 mt-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1a3330" strokeWidth="5" />
                  <motion.circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke="#E8601C"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - percentComplete / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-cream">{percentComplete}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-cream font-medium">{completionCount}/20 tasks</p>
                <p className="text-xs text-teal-muted">{totalXp.toLocaleString()} / {TOTAL_XP.toLocaleString()} XP</p>
                {userData?.created_at && (
                  <p className="text-xs text-teal-muted mt-1">
                    Joined {formatDate(userData.created_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-surface-raised border border-surface-border rounded-xl p-5"
      >
        <XPBar xp={totalXp} />
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { label: 'Tasks Completed', value: `${completionCount}/20`, icon: '✅' },
          { label: 'Badges Earned', value: `${badgeCount}/11`, icon: '🏅' },
          { label: 'Total XP', value: totalXp.toLocaleString(), icon: '⚡' },
          { label: 'Last Active', value: stats?.last_active ? formatRelativeTime(stats.last_active) : '—', icon: '🕐' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-surface-raised border border-surface-border rounded-xl p-4">
            <p className="text-xl mb-1">{stat.icon}</p>
            <p className="font-bold text-cream text-lg">{stat.value}</p>
            <p className="text-[11px] text-teal-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Streak */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <StreakCounter current={stats?.current_streak ?? 0} best={stats?.best_streak ?? 0} />
      </motion.div>

      {/* Watch goal */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <WatchDisplay percentComplete={percentComplete} compact />
      </motion.div>
    </div>
  )
}
