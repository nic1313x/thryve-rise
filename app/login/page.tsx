'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f2420] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌱</div>
          <h1 className="font-serif text-4xl text-cream mb-2">Thryve Rise</h1>
          <p className="text-teal-muted text-sm">Leadership transition tracker</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-raised border border-surface-border rounded-2xl p-8 text-center"
          >
            <div className="text-4xl mb-4">📬</div>
            <h2 className="font-serif text-xl text-cream mb-2">Check your email</h2>
            <p className="text-teal-muted text-sm leading-relaxed">
              We sent a magic link to <span className="text-cream font-medium">{email}</span>.
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-xs text-teal-muted underline hover:text-cream transition-colors"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <div className="bg-surface-raised border border-surface-border rounded-2xl p-8">
            <h2 className="font-serif text-xl text-cream mb-1">Sign in</h2>
            <p className="text-teal-muted text-sm mb-6">We'll send you a magic link. No password.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-teal-muted uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@thryvetogether.com"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-cream placeholder-teal-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-accent/50 focus:border-orange-accent/50 transition-all"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-orange-accent hover:bg-orange-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:shadow-lg hover:shadow-orange-accent/20"
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-xs text-teal-muted text-center">
                Access is invite-only. Contact{' '}
                <a href="mailto:nic@thryvetogether.com" className="text-cream hover:text-orange-accent transition-colors">
                  nic@thryvetogether.com
                </a>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
