'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from './Confetti'

interface WinScreenProps {
  isVisible: boolean
  totalXp: number
  tasksCompleted: number
}

export default function WinScreen({ isVisible, totalXp, tasksCompleted }: WinScreenProps) {
  const [step, setStep] = useState(0)
  const [confettiActive, setConfettiActive] = useState(false)

  useEffect(() => {
    if (!isVisible) return
    setStep(0)

    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2300),
      setTimeout(() => setStep(3), 3800),
      setTimeout(() => setStep(4), 5000),
      setTimeout(() => { setStep(5); setConfettiActive(true) }, 6000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  function handleShare() {
    const text = "I just completed the Thryve Rise challenge. 12 months. 20 tasks. One company built. 🏆"
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <Confetti trigger={confettiActive} variant="win" />

      <div className="text-center px-8 max-w-lg w-full">
        {/* Step 1: "You did it." */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="font-serif text-6xl md:text-7xl text-white mb-0"
            >
              You did it.
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Step 2: subtitle */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-white/60 text-lg mt-4 mb-8"
            >
              Every task. Every phase. Every system.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Step 3: Watch drop */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="mb-6"
            >
              <div className="mx-auto w-48 h-48 bg-gradient-to-br from-[#1a4a35] to-[#0a2018] rounded-full flex items-center justify-center border-4 border-hulk/50 hulk-glow">
                <span className="text-8xl">⌚</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Watch details */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <p className="font-serif text-2xl text-white mb-1">
                Rolex Submariner 116610LV — The Hulk
              </p>
              <p className="text-orange-accent font-semibold text-base">
                Nic is buying you this watch. You earned it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 5: Stats + Share */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center gap-8 mb-8 text-center">
                <div>
                  <p className="font-serif text-3xl text-white">{totalXp}</p>
                  <p className="text-xs text-white/50 mt-1">Total XP</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-white">{tasksCompleted}</p>
                  <p className="text-xs text-white/50 mt-1">Tasks Done</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-white">7</p>
                  <p className="text-xs text-white/50 mt-1">Level</p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="bg-orange-accent hover:bg-orange-hover text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-orange-accent/30"
              >
                Share Your Win 🏆
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
