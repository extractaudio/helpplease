import type { ScheduleShift, StoreId } from '@/domain/types'

export type StoreOpenStatus = {
  storeId: StoreId
  isOpen: boolean
  opensAt: string
  closesAt: string
  scheduledEmployees: string[]
  currentWorkers: string[]
}

const local = (instant: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
    .formatToParts(instant)
    .reduce<Record<string, string>>((value, part) => ({ ...value, [part.type]: part.value }), {})

const hoursForDay = (weekday: string) =>
  weekday === 'Sun' ? { opensAt: '12:00', closesAt: '17:00' } : { opensAt: '10:00', closesAt: '19:00' }

const displayTime = (value: string) => {
  const [hourText, minute] = value.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}${minute === '00' ? '' : `:${minute}`} ${suffix}`
}

export function storeStatusAt(storeId: StoreId, instant: Date, shifts: ScheduleShift[]): StoreOpenStatus {
  const parts = local(instant)
  const date = `${parts.year}-${parts.month}-${parts.day}`
  const time = `${parts.hour}:${parts.minute}`
  const hours = hoursForDay(parts.weekday)
  const today = shifts.filter(shift => shift.storeId === storeId && shift.businessDate === date)
  return {
    storeId,
    isOpen: time >= hours.opensAt && time < hours.closesAt,
    ...hours,
    scheduledEmployees: [...new Set(today.map(shift => shift.employeeName))],
    currentWorkers: today.filter(shift => shift.startTime <= time && shift.endTime > time).map(shift => shift.employeeName)
  }
}

export function storeHoursSummary(status: StoreOpenStatus, instant: Date) {
  if (status.isOpen) return `Open until ${displayTime(status.closesAt)}`
  const parts = local(instant)
  const time = `${parts.hour}:${parts.minute}`
  if (time < status.opensAt) return `Opens today at ${displayTime(status.opensAt)}`
  // Anchor at noon UTC (never near midnight in America/Denver) before adding 24h, so the
  // result lands on the correct next calendar day even across a DST transition.
  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T18:00:00Z`)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const nextWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short' }).format(tomorrow)
  const next = hoursForDay(nextWeekday)
  return `Opens tomorrow at ${displayTime(next.opensAt)}`
}

export function coverageFor(shifts: ScheduleShift[], date: string) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short' }).format(
    new Date(`${date}T18:00:00Z`)
  )
  const hours = hoursForDay(weekday)
  const periods = shifts
    .filter(shift => shift.businessDate === date)
    .map(shift => ({ start: shift.startTime, end: shift.endTime }))
    .sort((a, b) => a.start.localeCompare(b.start))
  const hasOpener = periods.some(period => period.start <= hours.opensAt && period.end > hours.opensAt)
  const hasCloser = periods.some(period => period.start < hours.closesAt && period.end >= hours.closesAt)
  let cursor = hours.opensAt
  let hasGap = false
  for (const period of periods) {
    if (period.end <= cursor) continue
    if (period.start > cursor) {
      hasGap = true
      break
    }
    cursor = period.end > cursor ? period.end : cursor
  }
  return { hasOpener, hasCloser, hasGap: hasGap || cursor < hours.closesAt }
}
