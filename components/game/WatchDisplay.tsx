'use client'

import { motion } from 'framer-motion'

interface WatchDisplayProps {
  percentComplete: number
  compact?: boolean
}

export default function WatchDisplay({ percentComplete, compact = false }: WatchDisplayProps) {
  const saturation = Math.round(30 + (percentComplete / 100) * 70)
  const brightness = Math.round(70 + (percentComplete / 100) * 30)

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-surface-raised border border-hulk/20 rounded-xl">
        <div className="text-2xl" style={{ filter: `saturate(${saturation}%) brightness(${brightness}%)` }}>
          🟢
        </div>
        <div>
          <p className="text-xs font-semibold text-cream">Playing for: The Hulk 🟢</p>
          <p className="text-xs text-hulk">{percentComplete}% complete</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-surface-raised border border-hulk/20 rounded-2xl overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 135, 90, 0.12) 0%, transparent 70%)',
          opacity: percentComplete / 100,
        }}
      />

      <div className="relative p-6 text-center">
        {/* Watch visual */}
        <motion.div
          className="mx-auto mb-5 relative"
          style={{ width: 160, height: 160 }}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Track */}
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="#1a3330"
              strokeWidth="6"
            />
            {/* Progress */}
            <motion.circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="#00875A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - percentComplete / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>

          {/* Watch face */}
          <div
            className="absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-1000"
            style={{
              background: 'radial-gradient(ellipse at 40% 30%, #1a4a35, #0a2018)',
              boxShadow: `0 0 ${percentComplete / 3}px rgba(0, 135, 90, 0.4)`,
              filter: `saturate(${saturation}%) brightness(${brightness}%)`,
            }}
          >
            <span className="text-4xl">⌚</span>
          </div>

          {/* Percent overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-3">
            <span className="text-xs font-bold text-hulk">{percentComplete}%</span>
          </div>
        </motion.div>

        {/* Watch details */}
        <div>
          <p className="font-serif text-lg text-cream mb-1">
            Rolex Submariner 116610LV
          </p>
          <p className="text-hulk font-semibold text-sm mb-3">— The Hulk</p>
          <p className="text-xs text-teal-muted leading-relaxed">
            Yours when you finish.<br />
            <span className="text-cream/80 font-medium">Nic's word.</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-hulk rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-teal-muted mt-1">
            <span>0 tasks</span>
            <span>20 tasks</span>
          </div>
        </div>

        {percentComplete >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-hulk/20 border border-hulk/40 rounded-xl p-3"
          >
            <p className="text-hulk font-semibold text-sm">🟢 Time to get the watch.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
