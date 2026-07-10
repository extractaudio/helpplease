import { describe, expect, it } from 'vitest'
import { initialState } from './data'
import { datePattern, hoursFor, timePattern } from './schedule'

describe('schedule data quality contract', () => {
  it('has one unique source shift key per schedule record', () => {
    const ids = initialState.shifts.map(shift => shift.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('has complete, valid, and positive-duration shifts', () => {
    for (const shift of initialState.shifts) {
      expect(shift.employeeId).not.toBe(''); expect(shift.storeId).not.toBe(''); expect(datePattern.test(shift.businessDate)).toBe(true)
      expect(timePattern.test(shift.startTime)).toBe(true); expect(timePattern.test(shift.endTime)).toBe(true); expect(hoursFor(shift)).toBeGreaterThan(0)
    }
  })
  it('preserves referential integrity to active employee profiles', () => {
    for (const shift of initialState.shifts) {
      const employee = initialState.profiles.find(profile => profile.uid === shift.employeeId)
      expect(employee?.status).toBe('active'); expect(employee?.storeId).toBe(shift.storeId); expect(employee?.fullName).toBe(shift.employeeName)
    }
  })
})
