'use client'

import { motion } from 'framer-motion'
import { BADGE_DEFINITIONS } from '@/lib/game/badges'
import { formatDate } from '@/lib/utils'

interface Props {
  earnedBadges: { badge_id: string; earned_at: string }[]
}

export default function BadgesClient({ earnedBadges }: Props) {
  const earnedMap = new Map(earnedBadges.map(b => [b.badge_id, b.earned_at]))
  const earnedCount = earnedMap.size

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl text-cream mb-1">Badges</h1>
        <p className="text-teal-muted text-sm">
          {earnedCount} of {BADGE_DEFINITIONS.length} earned
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-raised border border-surface-border rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-teal-muted uppercase tracking-wider font-medium">Badge Progress</span>
          <span className="text-sm font-bold text-cream">{Math.round((earnedCount / BADGE_DEFINITIONS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / BADGE_DEFINITIONS.length) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge, i) => {
          const earned = earnedMap.has(badge.id)
          const earnedAt = earnedMap.get(badge.id)
          const isHulk = badge.id === 'the_hulk'

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className={`
                relative rounded-xl p-4 border transition-all duration-300
                ${earned
                  ? isHulk
                    ? 'bg-hulk/10 border-hulk/30 hulk-glow'
                    : 'bg-surface-raised border-orange-accent/20'
                  : 'bg-surface-raised border-surface-border opacity-60'
                }
              `}
            >
              {!earned && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 backdrop-blur-[1px] z-10">
                  <span className="text-teal-muted text-lg">🔒</span>
                </div>
              )}

              <div className={`text-3xl mb-2 ${!earned ? 'grayscale' : ''}`}>
                {badge.icon}
              </div>

              <h3 className={`font-semibold text-sm mb-1 ${earned ? 'text-cream' : 'text-teal-muted'}`}>
                {badge.name}
              </h3>

              {earned ? (
                <>
                  <p className="text-[11px] text-teal-muted leading-snug">{badge.description}</p>
                  {earnedAt && (
                    <p className="text-[10px] text-orange-accent mt-2 font-medium">
                      Earned {formatDate(earnedAt)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-teal-muted/50 leading-snug">
                  {isHulk ? badge.lockedDescription : '???'}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
