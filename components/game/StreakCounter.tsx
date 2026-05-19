'use client'

import { motion } from 'framer-motion'

interface StreakCounterProps {
  current: number
  best: number
  compact?: boolean
}

export default function StreakCounter({ current, best, compact = false }: StreakCounterProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-orange-accent">🔥</span>
        <span className="text-sm font-bold text-cream">{current}</span>
        <span className="text-xs text-teal-muted">day streak</span>
      </div>
    )
  }

  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl p-4">
      <p className="text-xs text-teal-muted uppercase tracking-wider font-medium mb-3">Streak</p>
      <div className="flex items-end gap-4">
        <div>
          <motion.div
            key={current}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🔥</span>
            <span className="font-serif text-4xl text-cream">{current}</span>
          </motion.div>
          <p className="text-xs text-teal-muted mt-1">current streak</p>
        </div>
        <div className="pb-1">
          <p className="text-lg font-bold text-teal-muted">{best}</p>
          <p className="text-xs text-teal-muted">best</p>
        </div>
      </div>
      {current > 0 && (
        <p className="text-xs text-cream/60 mt-2">
          {current === best && current > 1 ? '🏆 Personal best!' : `${current} day${current === 1 ? '' : 's'} in a row`}
        </p>
      )}
    </div>
  )
}
