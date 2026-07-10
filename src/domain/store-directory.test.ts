import { describe, expect, it } from 'vitest'
import { canEditStore, mapHref, phoneHref } from '@/domain/store-directory'
import type { UserProfile } from '@/domain/types'

const profile = (role: UserProfile['role'], storeId: UserProfile['storeId'] = 'helena'): UserProfile => ({
  uid: 'u1', fullName: 'User', workEmail: 'u@example.com', personalGoogleEmail: 'u@gmail.com',
  cellPhone: '', jobTitle: '', storeId, role, status: 'active'
})

describe('store directory helpers', () => {
  it('normalizes phone actions', () => {
    expect(phoneHref('(406) 555-0130', 'tel')).toBe('tel:+14065550130')
    expect(phoneHref('', 'sms')).toBeNull()
  })

  it('creates an encoded map destination', () => {
    expect(mapHref('2750 North Montana Ave, Helena, MT')).toContain('query=2750%20North%20Montana')
  })

  it('enforces role and store edit boundaries', () => {
    expect(canEditStore(profile('area_manager'), 'bozeman')).toBe(true)
    expect(canEditStore(profile('store_manager'), 'helena')).toBe(true)
    expect(canEditStore(profile('store_manager'), 'bozeman')).toBe(false)
    expect(canEditStore(profile('employee'), 'helena')).toBe(false)
  })
})
