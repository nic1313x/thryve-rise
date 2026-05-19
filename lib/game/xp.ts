import type { LevelInfo } from '@/types'

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Operator',        minXp: 0,    maxXp: 99,   message: "You're in it. Doing the work. The journey starts here." },
  { level: 2, title: 'Delegator',       minXp: 100,  maxXp: 249,  message: "You stopped doing everything yourself. That's harder than it sounds." },
  { level: 3, title: 'Systems Builder', minXp: 250,  maxXp: 449,  message: "The business runs without you in the room. That's the first real unlock." },
  { level: 4, title: 'Growth Driver',   minXp: 450,  maxXp: 649,  message: "You're not just managing the work. You're building the machine." },
  { level: 5, title: 'Strategist',      minXp: 650,  maxXp: 899,  message: "Most founders never get here. You're thinking three moves ahead." },
  { level: 6, title: 'CEO',             minXp: 900,  maxXp: 1124, message: "The title is real now. Not because it's on a card — because it's in the calendar." },
  { level: 7, title: 'Architect',       minXp: 1125, maxXp: 1125, message: "You built something that runs without you. That's the whole game." },
]

export const TOTAL_XP = 1125

export function getLevelForXp(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getXpProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevelForXp(xp)
  if (level.level === 7) return { current: xp - level.minXp, needed: 0, percent: 100 }
  const nextLevel = LEVELS[level.level]
  const current = xp - level.minXp
  const needed = nextLevel.minXp - level.minXp
  return { current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) }
}

export function didLevelUp(oldXp: number, newXp: number): LevelInfo | null {
  const oldLevel = getLevelForXp(oldXp)
  const newLevel = getLevelForXp(newXp)
  if (newLevel.level > oldLevel.level) return newLevel
  return null
}
