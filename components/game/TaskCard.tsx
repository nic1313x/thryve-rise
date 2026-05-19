'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  isCompleted: boolean
  isLocked: boolean
  onComplete: (taskId: number) => void
  completedAt?: string
}

const impactColors: Record<string, string> = {
  'HIGH IMPACT': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'CRITICAL HIRE': 'bg-orange-accent/10 text-orange-accent border-orange-accent/20',
  'MILESTONE': 'bg-hulk/10 text-hulk border-hulk/20',
  'FINAL BOSS': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function TaskCard({ task, isCompleted, isLocked, onComplete, completedAt }: TaskCardProps) {
  const [checking, setChecking] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [particles, setParticles] = useState(false)

  async function handleComplete() {
    if (isCompleted || isLocked || checking) return
    setChecking(true)
    setParticles(true)
    setShowXP(true)
    setTimeout(() => setShowXP(false), 1200)
    setTimeout(() => setParticles(false), 800)
    await onComplete(task.id)
    setChecking(false)
  }

  const impactStyle = task.impact_label ? impactColors[task.impact_label] ?? 'bg-teal-muted/10 text-teal-muted border-teal-muted/20' : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isLocked ? 0.5 : 1, y: 0 }}
      className={`
        relative bg-surface-raised border rounded-xl p-4 transition-all duration-300
        ${isCompleted
          ? 'border-orange-accent/20 bg-orange-accent/5'
          : isLocked
          ? 'border-surface-border'
          : 'border-surface-border hover:border-teal-light/50 hover:bg-surface-elevated/50'
        }
      `}
    >
      {/* Particle burst */}
      <AnimatePresence>
        {particles && Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-orange-accent pointer-events-none"
            style={{ left: '20px', top: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: (Math.cos((i * Math.PI * 2) / 6) * 30),
              y: (Math.sin((i * Math.PI * 2) / 6) * 30),
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isCompleted || isLocked || checking}
          className="flex-shrink-0 mt-0.5 relative"
          aria-label={isCompleted ? 'Completed' : 'Mark complete'}
        >
          <motion.div
            animate={checking ? { scale: [1, 0.8, 1.2, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${isCompleted
                ? 'border-orange-accent bg-orange-accent'
                : isLocked
                ? 'border-surface-border cursor-not-allowed'
                : 'border-teal-muted hover:border-orange-accent cursor-pointer'
              }
            `}
          >
            {isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-white text-xs font-bold"
              >
                ✓
              </motion.span>
            )}
          </motion.div>

          {/* XP float */}
          <AnimatePresence>
            {showXP && (
              <motion.div
                initial={{ opacity: 1, y: 0, x: -10 }}
                animate={{ opacity: 0, y: -50 }}
                exit={{ opacity: 0 }}
                className="absolute -top-2 left-6 text-orange-accent font-bold text-sm whitespace-nowrap pointer-events-none z-10"
              >
                +{task.xp} XP
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">{task.icon}</span>
            <h3 className={`font-semibold text-sm leading-snug ${isCompleted ? 'line-through text-teal-muted' : 'text-cream'}`}>
              {task.title}
            </h3>
          </div>

          {!isCompleted && (
            <p className={`text-xs leading-relaxed mt-1 ${isLocked ? 'text-teal-muted/60' : 'text-teal-muted'}`}>
              {task.description}
            </p>
          )}

          {isCompleted && completedAt && (
            <p className="text-[10px] text-teal-muted mt-1">
              Completed {new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* XP badge */}
            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isCompleted ? 'bg-orange-accent/10 text-orange-accent border-orange-accent/20' : 'bg-surface-elevated text-teal-muted border-surface-border'
            }`}>
              {task.xp} XP
            </span>

            {/* Impact label */}
            {impactStyle && task.impact_label && (
              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${impactStyle}`}>
                {task.impact_label}
              </span>
            )}

            {/* Lock indicator */}
            {isLocked && (
              <span className="text-[10px] text-teal-muted/60 flex items-center gap-1">
                🔒 Complete previous phase to unlock
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
