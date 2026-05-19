'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LevelInfo } from '@/types'
import Confetti from './Confetti'

interface LevelUpModalProps {
  levelInfo: LevelInfo | null
  onDismiss: () => void
}

const levelIcons: Record<number, string> = {
  2: '🎯', 3: '⚙️', 4: '📈', 5: '🧠', 6: '💼', 7: '👑'
}

export default function LevelUpModal({ levelInfo, onDismiss }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (levelInfo) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 400)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [levelInfo, onDismiss])

  return (
    <>
      <Confetti trigger={visible} />
      <AnimatePresence>
        {visible && levelInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center px-8 max-w-md"
            >
              {/* Level icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-8xl mb-6"
              >
                {levelIcons[levelInfo.level] ?? '⭐'}
              </motion.div>

              {/* Level up text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-orange-accent text-sm font-semibold uppercase tracking-widest mb-2">
                  Level Up
                </p>
                <h2 className="font-serif text-5xl text-cream mb-2">
                  Level {levelInfo.level}
                </h2>
                <p className="text-orange-accent font-semibold text-2xl mb-6">
                  {levelInfo.title}
                </p>
                <p className="text-cream/80 text-base leading-relaxed italic">
                  "{levelInfo.message}"
                </p>
              </motion.div>

              {/* Progress ring */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-xs text-teal-muted"
              >
                Auto-dismissing...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
