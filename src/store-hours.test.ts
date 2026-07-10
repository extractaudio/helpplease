import { describe, expect, it } from 'vitest'
import { coverageFor, storeHoursSummary, storeStatusAt } from './store-hours'
import type { ScheduleShift } from './types'

const shift = (startTime: string, endTime: string, businessDate = '2026-07-10'): ScheduleShift => ({ id: `${startTime}-${endTime}`, employeeId: 'jamie', employeeName: 'Jamie Lee', storeId: 'helena', businessDate, startTime, endTime, jobTitle: 'Consultant', notes: '', sourceHash: '', syncedAt: '' })

describe('store hours', () => {
  it('uses Saturday business hours and identifies workers currently on shift', () => {
    const status = storeStatusAt('helena', new Date('2026-07-11T17:00:00Z'), [shift('10:00', '18:00', '2026-07-11')])
    expect(status).toMatchObject({ isOpen: true, opensAt: '10:00', closesAt: '19:00', currentWorkers: ['Jamie Lee'] })
  })

  it('uses shorter Sunday hours', () => {
    expect(storeStatusAt('helena', new Date('2026-07-12T18:00:00Z'), []).isOpen).toBe(true)
    expect(storeStatusAt('helena', new Date('2026-07-12T23:00:00Z'), []).isOpen).toBe(false)
  })

  it('recognizes split-shift coverage instead of requiring one all-day shift', () => {
    expect(coverageFor([shift('10:00', '14:00'), shift('14:00', '19:00')], '2026-07-10')).toMatchObject({ hasOpener: true, hasCloser: true, hasGap: false })
  })

  it('describes an open store with its closing time', () => {
    const instant = new Date('2026-07-11T17:00:00Z')
    expect(storeHoursSummary(storeStatusAt('helena', instant, []), instant)).toBe('Open until 7 PM')
  })

  it('describes the next Sunday opening after Saturday close', () => {
    const instant = new Date('2026-07-12T02:00:00Z')
    expect(storeHoursSummary(storeStatusAt('helena', instant, []), instant)).toBe('Opens tomorrow at 12 PM')
  })
})
