import type { ScheduleRow, ScheduleShift, StoreId, UserProfile } from '@/domain/types'

const storeNames: Record<string, StoreId> = {
  helena: 'helena',
  bozeman: 'bozeman',
  'billings main': 'billings-main',
  'billings west': 'billings-west',
  missoula: 'missoula'
}

export const requiredScheduleHeaders = [
  'Shift ID',
  'Employee Name',
  'Work Email',
  'Store',
  'Date',
  'Start Time',
  'End Time',
  'Job Title',
  'Notes'
] as const

export const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
export const datePattern = /^\d{4}-\d{2}-\d{2}$/
export const normalized = (value: string) => value.trim().toLocaleLowerCase()

export const hoursFor = (shift: Pick<ScheduleShift, 'startTime' | 'endTime'>) => {
  const [sh, sm] = shift.startTime.split(':').map(Number)
  const [eh, em] = shift.endTime.split(':').map(Number)
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60)
}

export const validateScheduleRow = (row: Partial<ScheduleRow>, profiles: UserProfile[]) => {
  const errors: string[] = []
  for (const header of requiredScheduleHeaders) {
    if (!String(row[header] ?? '').trim() && header !== 'Notes') errors.push(`${header} is required`)
  }
  if (row.Date && !datePattern.test(row.Date)) errors.push('Date must use YYYY-MM-DD')
  if (row['Start Time'] && !timePattern.test(row['Start Time'])) errors.push('Start Time must use HH:mm')
  if (row['End Time'] && !timePattern.test(row['End Time'])) errors.push('End Time must use HH:mm')
  if (row.Store && !storeNames[normalized(row.Store)]) errors.push('Store must match a Montana store')
  if (row['Start Time'] && row['End Time'] && row['Start Time'] >= row['End Time']) {
    errors.push('End Time must be after Start Time')
  }
  const person = profiles.find(profile => normalized(profile.workEmail) === normalized(row['Work Email'] || ''))
  if (!person || person.status !== 'active') {
    errors.push('Work Email must match an active employee')
  } else if (
    normalized(person.fullName) !== normalized(row['Employee Name'] || '') ||
    person.storeId !== storeNames[normalized(row.Store || '')]
  ) {
    errors.push('Employee name and store must match the profile')
  }
  return {
    valid: errors.length === 0,
    errors,
    employeeId: person?.uid,
    storeId: row.Store ? storeNames[normalized(row.Store)] : undefined
  }
}

export const shiftFromRow = (row: ScheduleRow, profiles: UserProfile[]): ScheduleShift => {
  const result = validateScheduleRow(row, profiles)
  if (!result.valid || !result.employeeId || !result.storeId) throw new Error(result.errors.join('; '))
  const sourceHash = JSON.stringify(row)
  return {
    id: row['Shift ID'],
    employeeId: result.employeeId,
    employeeName: row['Employee Name'],
    storeId: result.storeId,
    businessDate: row.Date,
    startTime: row['Start Time'],
    endTime: row['End Time'],
    jobTitle: row['Job Title'],
    notes: row.Notes,
    sourceHash,
    syncedAt: new Date().toISOString()
  }
}

export const overlaps = (a: ScheduleShift, b: ScheduleShift) =>
  a.employeeId === b.employeeId && a.businessDate === b.businessDate && a.startTime < b.endTime && b.startTime < a.endTime

export const toIcs = (shifts: ScheduleShift[], stores: { id: string; name: string; address: string; phone: string }[]) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Montana PQH Team//EN',
    ...shifts.flatMap(shift => {
      const store = stores.find(item => item.id === shift.storeId)
      const stamp = (time: string) => `${shift.businessDate.replaceAll('-', '')}T${time.replace(':', '')}00`
      return [
        'BEGIN:VEVENT',
        `UID:${shift.id}@pqh-team`,
        `DTSTART:${stamp(shift.startTime)}`,
        `DTEND:${stamp(shift.endTime)}`,
        `SUMMARY:Montana PQH - ${store?.name ?? shift.storeId} Shift`,
        `LOCATION:${store?.address ?? ''}`,
        `DESCRIPTION:${[store?.phone, shift.notes].filter(Boolean).join(' | ')}`,
        'END:VEVENT'
      ]
    }),
    'END:VCALENDAR'
  ].join('\r\n')
