'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const playerNav = [
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/roadmap',   icon: '🗺️', label: 'Roadmap' },
  { href: '/badges',    icon: '🏅', label: 'Badges' },
  { href: '/profile',   icon: '👤', label: 'Profile' },
]

const adminNav = [
  { href: '/admin/dashboard', icon: '📊', label: 'Overview' },
  { href: '/admin/tasks',     icon: '✅', label: 'Tasks' },
  { href: '/admin/activity',  icon: '📡', label: 'Activity' },
  { href: '/setup',           icon: '⚙️', label: 'Setup' },
]

interface SidebarProps {
  role: 'player' | 'admin'
  userEmail?: string
}

export default function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = role === 'admin' ? adminNav : playerNav

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-surface-raised border-r border-surface-border px-4 py-6 fixed left-0 top-0 bottom-0 z-20">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="font-serif text-lg text-cream leading-none">Thryve Rise</p>
            <p className="text-[11px] text-teal-muted mt-0.5">
              {role === 'admin' ? 'Admin View' : 'Your Journey'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? 'text-cream bg-teal-light/40'
                  : 'text-teal-muted hover:text-cream hover:bg-surface-elevated'
                }
              `}>
                {active && (
                  <motion.div
                    layoutId={`sidebar-active-${role}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-accent rounded-full"
                  />
                )}
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User / Sign out */}
      <div className="border-t border-surface-border pt-4 mt-4">
        {userEmail && (
          <p className="text-xs text-teal-muted px-2 mb-3 truncate">{userEmail}</p>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-muted hover:text-cream hover:bg-surface-elevated transition-all"
        >
          <span className="text-base">→</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
