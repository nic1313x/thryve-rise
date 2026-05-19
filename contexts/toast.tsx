'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ToastItem {
  id: string
  message: string
  type?: 'success' | 'badge' | 'error'
  icon?: string
  subtitle?: string
}

interface ToastContextValue {
  showToast: (message: string, options?: { type?: ToastItem['type']; icon?: string; subtitle?: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, options?: { type?: ToastItem['type']; icon?: string; subtitle?: string }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, ...options }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-sm
                border backdrop-blur-sm
                ${toast.type === 'badge'
                  ? 'bg-teal-primary/95 border-orange-accent/40'
                  : toast.type === 'error'
                  ? 'bg-red-900/95 border-red-500/40'
                  : 'bg-surface-raised/95 border-surface-border/60'
                }
              `}>
                {toast.icon && (
                  <span className="text-2xl leading-none flex-shrink-0">{toast.icon}</span>
                )}
                <div>
                  <p className="text-sm font-medium text-cream leading-snug">{toast.message}</p>
                  {toast.subtitle && (
                    <p className="text-xs text-teal-muted mt-0.5">{toast.subtitle}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
