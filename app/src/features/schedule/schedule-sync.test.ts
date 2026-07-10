import { describe, expect, it } from 'vitest'
import { reconcileScheduleRows } from '../../../../functions/src/schedule-sync'

const profile = { uid: 'jamie', fullName: 'Jamie Lee', workEmail: 'jamie@example.com', storeId: 'helena' }
const row = { 'Shift ID': 'shift-1', 'Employee Name': 'Jamie Lee', 'Work Email': 'jamie@example.com', Store: 'Helena', Date: '2026-07-10', 'Start Time': '10:00', 'End Time': '18:00', 'Job Title': 'Consultant', Notes: '' }

describe('schedule reconciliation', () => {
  it('identifies added, changed, and removed shifts', () => {
    const added = reconcileScheduleRows([row], [profile], [])
    expect(added.changes[0]).toMatchObject({ type: 'added', employeeId: 'jamie' })
    const changed = reconcileScheduleRows([{ ...row, 'End Time': '19:00' }], [profile], added.upserts)
    expect(changed.changes[0].type).toBe('changed')
    const removed = reconcileScheduleRows([], [profile], added.upserts)
    expect(removed).toMatchObject({ deleteIds: ['shift-1'] }); expect(removed.changes[0].type).toBe('removed')
  })

  it('rejects duplicate or identity-mismatched rows', () => {
    expect(reconcileScheduleRows([row, row, { ...row, 'Shift ID': 'shift-2', Store: 'Bozeman' }], [profile], []).issues).toEqual(['shift-1', 'shift-2'])
  })
})
