import { describe, expect, it } from 'vitest'
import { addMetrics, monthlyActualsFor, monthlyGoalFor, pacePercent, payoutFor, statusFor } from '@/domain/metrics'
import { initialState, zeroMetrics } from '@/data'
import { shiftFromRow, toIcs, validateScheduleRow } from '@/domain/schedule'

describe('performance logic', () => {
  it('aggregates each metric independently', () => {
    const a = { ...zeroMetrics(), grossAdds: 2, upgrades: 1 }
    const b = { ...zeroMetrics(), grossAdds: 3, upgrades: 4 }
    expect(addMetrics([a, b])).toMatchObject({ grossAdds: 5, upgrades: 5 })
  })
  it('sums a single employee\'s entries for the given month', () => {
    const entries = [
      { id: '1', employeeId: 'jamie', storeId: 'helena' as const, businessDate: '2026-07-05', metrics: { ...zeroMetrics(), grossAdds: 2 }, notes: '', updatedBy: 'jamie', updatedAt: '' },
      { id: '2', employeeId: 'jamie', storeId: 'helena' as const, businessDate: '2026-07-20', metrics: { ...zeroMetrics(), grossAdds: 3 }, notes: '', updatedBy: 'jamie', updatedAt: '' },
      { id: '3', employeeId: 'alex', storeId: 'bozeman' as const, businessDate: '2026-07-05', metrics: { ...zeroMetrics(), grossAdds: 99 }, notes: '', updatedBy: 'alex', updatedAt: '' },
      { id: '4', employeeId: 'jamie', storeId: 'helena' as const, businessDate: '2026-06-30', metrics: { ...zeroMetrics(), grossAdds: 99 }, notes: '', updatedBy: 'jamie', updatedAt: '' }
    ]
    expect(monthlyActualsFor(entries, 'jamie', '2026-07').grossAdds).toBe(5)
  })
  it('finds the goal matching an employee and month', () => {
    const goals = [{ id: 'a', employeeId: 'jamie', storeId: 'helena' as const, monthKey: '2026-07', targets: zeroMetrics() }]
    expect(monthlyGoalFor(goals, 'jamie', '2026-07')).toBe(goals[0])
    expect(monthlyGoalFor(goals, 'jamie', '2026-08')).toBeUndefined()
  })
  it('computes pace using the Denver calendar for both day-of-month and days-in-month', () => {
    // 11pm Denver on Oct 31 = 05:00 UTC Nov 1 -- a UTC-based browser would already see November.
    expect(pacePercent(new Date('2026-11-01T05:00:00Z'))).toBe(1)
    // Leap-year February: Denver day 28 of a 29-day month.
    expect(pacePercent(new Date('2024-02-28T20:00:00Z'))).toBeCloseTo(28 / 29)
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
