export type EntryMode = 'welcome' | 'demo' | 'live'
export type EntryAction = 'demo' | 'live' | 'leave'

export function nextEntryMode(current: EntryMode, action: EntryAction): EntryMode {
  if (action === 'leave') return 'welcome'
  if (current !== 'welcome') return current
  return action
}
