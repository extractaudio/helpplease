import { describe, expect, it } from 'vitest'
import { addMetrics, payoutFor, statusFor } from '@/domain/metrics'
import { initialState, zeroMetrics } from '@/data'
import { shiftFromRow, toIcs, validateScheduleRow } from '@/domain/schedule'

describe('performance logic', () => {
  it('aggregates each metric independently', () => {
    const a = { ...zeroMetrics(), grossAdds: 2, upgrades: 1 }
    const b = { ...zeroMetrics(), grossAdds: 3, upgrades: 4 }
    expect(addMetrics([a, b])).toMatchObject({ grossAdds: 5, upgrades: 5 })
  })
  it('uses pace-aware status colors', () => {
    expect(statusFor(10, 20, .5)).toBe('green')
    expect(statusFor(8, 20, .5)).toBe('yellow')
    expect(statusFor(7, 20, .5)).toBe('red')
    expect(statusFor(0, 0, .5)).toBe('neutral')
  })
  it('excludes the accessory commission band from fixed payout', () => {
    const metrics = { ...zeroMetrics(), leases: 1, accessories: 9, homeInternet: 1 }
    expect(payoutFor(metrics, initialState.rules)).toBe(2500)
  })
  it('accepts the documented App Schedule row contract', () => {
    const row = { 'Shift ID':'s-1','Employee Name':'Jamie Lee','Work Email':'jamie.lee@example.com',Store:'Helena',Date:'2026-07-10','Start Time':'10:00','End Time':'18:00','Job Title':'Wireless Consultant',Notes:'Open shift' }
    expect(validateScheduleRow(row, initialState.profiles).valid).toBe(true)
    expect(shiftFromRow(row, initialState.profiles).employeeId).toBe('jamie')
  })
  it('rejects schedule rows with unsafe timing or identity mismatches', () => {
    const row = { 'Shift ID':'s-2','Employee Name':'Jamie Lee','Work Email':'jamie.lee@example.com',Store:'Helena',Date:'2026-07-10','Start Time':'18:00','End Time':'10:00','Job Title':'Wireless Consultant',Notes:'' }
    expect(validateScheduleRow(row, initialState.profiles).errors).toContain('End Time must be after Start Time')
  })
  it('creates calendar-compatible ICS content', () => {
    expect(toIcs(initialState.shifts, initialState.profiles.length ? [{...storesStub}] : [])).toContain('BEGIN:VCALENDAR')
  })
})

const storesStub = { id:'helena', name:'Helena', address:'2750 North Montana Ave, Helena, MT', phone:'(406) 555-0130' }
