import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
  role: 'player' | 'admin'
  userEmail?: string
}

export default function AppShell({ children, role, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0f2420]">
      <Sidebar role={role} userEmail={userEmail} />
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
      <BottomNav role={role} />
    </div>
  )
}
