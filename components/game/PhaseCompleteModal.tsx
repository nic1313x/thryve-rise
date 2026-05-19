'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHASE_META } from '@/lib/game/tasks'

interface PhaseCompleteModalProps {
  phase: number | null
  onDismiss: () => void
}

const phaseIcons = ['🏗️', '⚙️', '🚀', '👑']

export default function PhaseCompleteModal({ phase, onDismiss }: PhaseCompleteModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (phase !== null) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 400)
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [phase, onDismiss])

  const meta = phase ? PHASE_META[phase - 1] : null

  return (
    <AnimatePresence>
      {visible && meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="bg-surface-raised border border-orange-accent/30 rounded-2xl p-10 text-center max-w-md mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.5 }}
              className="text-7xl mb-5"
            >
              {phaseIcons[meta.phase - 1]}
            </motion.div>

            <p className="text-orange-accent text-xs font-semibold uppercase tracking-widest mb-2">
              Phase {meta.phase} Complete
            </p>
            <h2 className="font-serif text-3xl text-cream mb-3">{meta.name}</h2>
            <p className="text-teal-muted italic mb-2">"{meta.tagline}"</p>

            {phase < 4 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-sm text-cream/60 mt-4"
              >
                Phase {phase + 1} is now unlocked. 🔓
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
