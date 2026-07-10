import { describe, expect, it } from 'vitest'
import { emptyMetrics, normalizeProfile, toCsv } from '@/services/repository'

describe('repository helpers', () => {
  it('normalizes incomplete legacy profiles into an onboarding-safe profile', () => {
    expect(normalizeProfile('u-1', { fullName: 'Jamie Lee', storeId: 'helena' })).toMatchObject({
      uid: 'u-1', fullName: 'Jamie Lee', storeId: 'helena', role: 'employee', status: 'pending',
      workEmail: '', personalGoogleEmail: '', cellPhone: '', jobTitle: ''
    })
  })

  it('creates a complete empty metric record', () => {
    expect(emptyMetrics()).toMatchObject({ grossAdds: 0, upgrades: 0, homeInternet: 0, milestoneSheets: 0 })
  })

  it('creates CSV that preserves commas and quotes', () => {
    expect(toCsv([{ name: 'Jamie, Lee', note: 'Said "great"' }])).toBe('name,note\r\n"Jamie, Lee","Said ""great"""')
  })
})
