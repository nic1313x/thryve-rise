export const TOAST_MESSAGES = [
  "Task complete. One less thing tying you to the work.",
  "That's how it starts. One system at a time.",
  "Delegation in progress. This is what building looks like.",
  "Momentum compounds. Keep going.",
  "The work is working.",
  "You're not building a job. You're building a company.",
  "One step further from operator. One step closer to architect.",
  "This is what the $5M version of Thryve looks like.",
  "Clarity over chaos. Every single time.",
  "Clean systems. Real growth. That's the Thryve way.",
]

export const HULK_TOAST_SUFFIX = " The Hulk gets closer. 🟢"

export function getRandomToastMessage(addHulkSuffix = false): string {
  const msg = TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)]
  if (addHulkSuffix) return msg + HULK_TOAST_SUFFIX
  return msg
}

export function shouldShowHulkSuffix(): boolean {
  return Math.random() < 0.2
}

export function shouldShowConfetti(): boolean {
  return Math.random() < 0.3
}
