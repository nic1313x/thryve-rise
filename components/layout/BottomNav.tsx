'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const playerNav = [
  { href: '/dashboard', icon: '⚡', label: 'Home' },
  { href: '/roadmap',   icon: '🗺️', label: 'Roadmap' },
  { href: '/badges',    icon: '🏅', label: 'Badges' },
  { href: '/profile',   icon: '👤', label: 'Profile' },
]

const adminNav = [
  { href: '/admin/dashboard', icon: '📊', label: 'Overview' },
  { href: '/admin/tasks',     icon: '✅', label: 'Tasks' },
  { href: '/admin/activity',  icon: '📡', label: 'Activity' },
]

export default function BottomNav({ role }: { role: 'player' | 'admin' }) {
  const pathname = usePathname()
  const nav = role === 'admin' ? adminNav : playerNav

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface-raised border-t border-surface-border pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-4 py-1.5">
              <span className={`text-xl transition-all ${active ? 'scale-110' : 'opacity-60'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-orange-accent' : 'text-teal-muted'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
