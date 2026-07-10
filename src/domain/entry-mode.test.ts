import { describe, expect, it } from 'vitest'
import { nextEntryMode } from '@/domain/entry-mode'

describe('entry mode', () => {
  it('moves from welcome into either local demo or secure live access', () => {
    expect(nextEntryMode('welcome', 'demo')).toBe('demo')
    expect(nextEntryMode('welcome', 'live')).toBe('live')
  })

  it('returns to welcome when a visitor leaves the selected mode', () => {
    expect(nextEntryMode('demo', 'leave')).toBe('welcome')
    expect(nextEntryMode('live', 'leave')).toBe('welcome')
  })
})
