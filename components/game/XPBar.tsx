'use client'

import { motion } from 'framer-motion'
import { getLevelForXp, getXpProgress, LEVELS } from '@/lib/game/xp'

interface XPBarProps {
  xp: number
  animated?: boolean
}

export default function XPBar({ xp, animated = true }: XPBarProps) {
  const level = getLevelForXp(xp)
  const progress = getXpProgress(xp)
  const nextLevel = LEVELS[level.level] // undefined if max level

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-orange-accent uppercase tracking-wider">
            Level {level.level}
          </span>
          <span className="text-xs text-cream/60">·</span>
          <span className="text-xs text-cream/80 font-medium">{level.title}</span>
        </div>
        <span className="text-xs text-teal-muted">
          {level.level < 7 ? (
            <>{progress.current} / {progress.needed} XP</>
          ) : (
            <span className="text-orange-accent font-semibold">MAX LEVEL</span>
          )}
        </span>
      </div>

      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden border border-surface-border">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-accent to-orange-hover rounded-full"
          initial={animated ? { width: 0 } : { width: `${progress.percent}%` }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </div>

      {level.level < 7 && nextLevel && (
        <p className="text-[10px] text-teal-muted mt-1 text-right">
          {nextLevel.minXp - xp} XP to {nextLevel.title}
        </p>
      )}
    </div>
  )
}
