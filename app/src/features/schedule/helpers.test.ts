import { describe, expect, it } from 'vitest'
import { filteredView } from './helpers'
import type { ScheduleShift } from '@/domain/types'

const shift = (businessDate: string): ScheduleShift => ({
  id: businessDate, employeeId: 'jamie', employeeName: 'Jamie Lee', storeId: 'helena',
  businessDate, startTime: '10:00', endTime: '18:00', jobTitle: 'Consultant', notes: '', sourceHash: '', syncedAt: ''
})

describe('filteredView', () => {
  it('limits the weekly view to a 7-day window instead of the rest of the month', () => {
    const shifts = ['2026-07-03', '2026-07-09', '2026-07-10', '2026-07-15', '2026-07-31'].map(shift)
    const shown = filteredView(shifts, 'weekly', '2026-07-03').map(item => item.businessDate)
    expect(shown).toEqual(['2026-07-03', '2026-07-09'])
    expect(shown).not.toContain('2026-07-10')
    expect(shown).not.toContain('2026-07-31')
  })

  it('rolls the weekly window across a month boundary', () => {
    const shifts = ['2026-07-29', '2026-08-03', '2026-08-05'].map(shift)
    const shown = filteredView(shifts, 'weekly', '2026-07-29').map(item => item.businessDate)
    expect(shown).toEqual(['2026-07-29', '2026-08-03'])
  })

  it('keeps the daily and monthly views unchanged', () => {
    const shifts = ['2026-07-03', '2026-07-10', '2026-08-01'].map(shift)
    expect(filteredView(shifts, 'daily', '2026-07-03').map(item => item.businessDate)).toEqual(['2026-07-03'])
    expect(filteredView(shifts, 'monthly', '2026-07-03').map(item => item.businessDate)).toEqual(['2026-07-03', '2026-07-10'])
  })
})
