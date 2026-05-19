import type { BadgeDefinition } from '@/types'

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_steps',
    icon: '🌱',
    name: 'First Steps',
    description: 'Completed your first task. The map is now real.',
    lockedDescription: '???',
  },
  {
    id: 'in_motion',
    icon: '🔥',
    name: 'In Motion',
    description: 'Completed all of Phase 1. The foundation is built.',
    lockedDescription: '???',
  },
  {
    id: 'systems_thinker',
    icon: '⚡',
    name: 'Systems Thinker',
    description: 'Completed all of Phase 2. Thryve runs without you in the room.',
    lockedDescription: '???',
  },
  {
    id: 'growth_mode',
    icon: '🚀',
    name: 'Growth Mode',
    description: 'Completed all of Phase 3. The engine is running.',
    lockedDescription: '???',
  },
  {
    id: 'architect',
    icon: '👑',
    name: 'Architect',
    description: 'Completed all 20 tasks. You built something that runs without you.',
    lockedDescription: '???',
  },
  {
    id: 'voice_of_thryve',
    icon: '🎤',
    name: 'Voice of Thryve',
    description: 'You showed up publicly. That door is now open.',
    lockedDescription: '???',
  },
  {
    id: 'rainmaker',
    icon: '🤝',
    name: 'Rainmaker',
    description: 'Closed a deal from your reputation. That\'s the whole game.',
    lockedDescription: '???',
  },
  {
    id: 'culture_builder',
    icon: '📜',
    name: 'Culture Builder',
    description: 'Wrote the Thryve Way. Leaders write this. Employees live it.',
    lockedDescription: '???',
  },
  {
    id: 'xp_100',
    icon: '💎',
    name: '100 XP Club',
    description: 'Hit 100 XP. Momentum compounds.',
    lockedDescription: '???',
  },
  {
    id: 'halfway',
    icon: '⭐',
    name: 'Halfway There',
    description: 'Completed 50% of all tasks. The second half is the real work.',
    lockedDescription: '???',
  },
  {
    id: 'the_hulk',
    icon: '🟢',
    name: 'The Hulk',
    description: 'Complete all 20 tasks. You know what happens.',
    lockedDescription: 'Complete all 20 tasks. You know what happens.',
  },
]

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === id)
}

export function checkNewBadges(
  completedTaskIds: number[],
  totalXp: number,
  earnedBadgeIds: string[]
): BadgeDefinition[] {
  const newBadges: BadgeDefinition[] = []
  const phase1Tasks = [1, 2, 3, 4, 5]
  const phase2Tasks = [6, 7, 8, 9, 10]
  const phase3Tasks = [11, 12, 13, 14, 15]
  const allTasks = Array.from({ length: 20 }, (_, i) => i + 1)

  const check = (id: string, condition: boolean) => {
    if (condition && !earnedBadgeIds.includes(id)) {
      const badge = getBadgeById(id)
      if (badge) newBadges.push(badge)
    }
  }

  check('first_steps', completedTaskIds.includes(1))
  check('in_motion', phase1Tasks.every(id => completedTaskIds.includes(id)))
  check('systems_thinker', phase2Tasks.every(id => completedTaskIds.includes(id)))
  check('growth_mode', phase3Tasks.every(id => completedTaskIds.includes(id)))
  check('architect', allTasks.every(id => completedTaskIds.includes(id)))
  check('voice_of_thryve', completedTaskIds.includes(12))
  check('rainmaker', completedTaskIds.includes(18))
  check('culture_builder', completedTaskIds.includes(19))
  check('xp_100', totalXp >= 100)
  check('halfway', completedTaskIds.length >= 10)
  check('the_hulk', allTasks.every(id => completedTaskIds.includes(id)))

  return newBadges
}
