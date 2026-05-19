export interface User {
  id: string
  email: string
  role: 'player' | 'admin'
  created_at: string
}

export interface Task {
  id: number
  phase: number
  title: string
  description: string
  icon: string
  xp: number
  impact_label: string
}

export interface Completion {
  id: string
  user_id: string
  task_id: number
  completed_at: string
  tasks?: Task
}

export interface UserStats {
  user_id: string
  total_xp: number
  level: number
  last_active: string
  current_phase: number
  current_streak: number
  best_streak: number
  last_completion_date: string | null
}

export interface LevelInfo {
  level: number
  title: string
  minXp: number
  maxXp: number
  message: string
}

export interface BadgeDefinition {
  id: string
  icon: string
  name: string
  description: string
  lockedDescription: string
}

export interface EarnedBadge {
  id: string
  earned_at: string
}

export interface CompleteTaskResponse {
  success: boolean
  error?: string
  newStats?: UserStats
  levelUp?: LevelInfo | null
  newBadges?: BadgeDefinition[]
  xpEarned?: number
}

export interface PhaseInfo {
  phase: number
  name: string
  tagline: string
  months: string
  tasks: Task[]
  completedCount: number
  isUnlocked: boolean
}
