'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger: boolean
  variant?: 'normal' | 'hulk' | 'win'
}

export default function Confetti({ trigger, variant = 'normal' }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return

    if (variant === 'win') {
      // Epic win sequence
      const duration = 5000
      const end = Date.now() + duration
      const colors = ['#E8601C', '#1E3D35', '#F5F1EB', '#00875A', '#ffffff']

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors,
        })
      }, 500)

    } else if (variant === 'hulk') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00875A', '#E8601C', '#F5F1EB', '#1E3D35'],
      })
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E8601C', '#F5F1EB', '#1E3D35', '#2d5a4e'],
      })
    }
  }, [trigger, variant])

  return null
}
