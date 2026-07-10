export const expectedScheduleHeaders = ['Shift ID','Employee Name','Work Email','Store','Date','Start Time','End Time','Job Title','Notes'] as const
type Header = typeof expectedScheduleHeaders[number]
export type ScheduleRow = Record<Header, string>
export type ScheduleProfile = { uid: string; fullName: string; workEmail: string; storeId: string }
export type StoredShift = { id: string; employeeId: string; employeeName: string; storeId: string; businessDate: string; startTime: string; endTime: string; jobTitle: string; notes: string; sourceHash: string }
export type ScheduleChange = { employeeId: string; shiftId: string; type: 'added' | 'changed' | 'removed'; message: string }
export type Reconciliation = { upserts: StoredShift[]; deleteIds: string[]; changes: ScheduleChange[]; issues: string[] }

const storeIds: Record<string, string> = { helena: 'helena', bozeman: 'bozeman', 'billings main': 'billings-main', 'billings west': 'billings-west', missoula: 'missoula' }
const normalized = (value: string) => value.trim().toLowerCase()
const isoDate = /^\d{4}-\d{2}-\d{2}$/; const time = /^([01]\d|2[0-3]):[0-5]\d$/

export function reconcileScheduleRows(rows: ScheduleRow[], profiles: ScheduleProfile[], existing: StoredShift[]): Reconciliation {
  const byEmail = new Map(profiles.map(profile => [normalized(profile.workEmail), profile])); const valid = new Map<string, StoredShift>(); const issues: string[] = []
  for (const row of rows) {
    const identity = byEmail.get(normalized(row['Work Email'])); const storeId = storeIds[normalized(row.Store)]
    const validRow = expectedScheduleHeaders.slice(0, 8).every(header => row[header]?.trim()) && isoDate.test(row.Date) && time.test(row['Start Time']) && time.test(row['End Time']) && row['Start Time'] < row['End Time'] && identity && storeId && normalized(identity.fullName) === normalized(row['Employee Name']) && identity.storeId === storeId
    if (!validRow || valid.has(row['Shift ID'])) { issues.push(row['Shift ID'] || 'row without Shift ID'); continue }
    valid.set(row['Shift ID'], { id: row['Shift ID'], employeeId: identity.uid, employeeName: row['Employee Name'], storeId, businessDate: row.Date, startTime: row['Start Time'], endTime: row['End Time'], jobTitle: row['Job Title'], notes: row.Notes || '', sourceHash: JSON.stringify(row) })
  }
  const prior = new Map(existing.map(shift => [shift.id, shift])); const upserts = [...valid.values()].filter(shift => prior.get(shift.id)?.sourceHash !== shift.sourceHash); const deleteIds = existing.filter(shift => !valid.has(shift.id)).map(shift => shift.id)
  const changes: ScheduleChange[] = upserts.map(shift => ({ employeeId: shift.employeeId, shiftId: shift.id, type: prior.has(shift.id) ? 'changed' : 'added', message: prior.has(shift.id) ? `Your shift on ${shift.businessDate} has changed.` : `You've been added to ${shift.businessDate}.` }))
  for (const id of deleteIds) { const shift = prior.get(id)!; changes.push({ employeeId: shift.employeeId, shiftId: id, type: 'removed', message: `Your shift on ${shift.businessDate} has been removed.` }) }
  return { upserts, deleteIds, changes, issues }
}
