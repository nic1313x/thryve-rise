'use client'

import { motion } from 'framer-motion'
import { getLevelForXp } from '@/lib/game/xp'

const levelColors: Record<number, string> = {
  1: 'border-teal-muted/40 text-teal-muted',
  2: 'border-blue-400/40 text-blue-400',
  3: 'border-purple-400/40 text-purple-400',
  4: 'border-yellow-400/40 text-yellow-400',
  5: 'border-orange-accent/40 text-orange-accent',
  6: 'border-orange-accent text-orange-accent',
  7: 'border-hulk/60 text-hulk',
}

interface LevelBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function LevelBadge({ xp, size = 'md', animate = false }: LevelBadgeProps) {
  const level = getLevelForXp(xp)
  const colorClass = levelColors[level.level] ?? levelColors[1]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const badge = (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full border font-semibold
      ${colorClass} ${sizeClasses[size]}
    `}>
      <span className="text-xs">Lvl {level.level}</span>
      <span className="opacity-60">·</span>
      <span>{level.title}</span>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}
