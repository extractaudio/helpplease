import type { ScheduleShift, Store } from '@/domain/types'

export function currentTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
}

export function filteredView(shifts: ScheduleShift[], view: 'daily' | 'weekly' | 'monthly', today: string) {
  return shifts.filter(shift =>
    view === 'daily'
      ? shift.businessDate === today
      : view === 'weekly'
        ? shift.businessDate >= today && shift.businessDate <= `${today.slice(0, 8)}99`
        : shift.businessDate.startsWith(today.slice(0, 7))
  )
}

export function storeOpenLabel() {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short' }).format(new Date())
  const time = currentTime()
  return day === 'Sun'
    ? (time >= '12:00' && time < '17:00' ? 'Open' : 'Closed')
    : (time >= '10:00' && time < '19:00' ? 'Open' : 'Closed')
}

export function coverageLabel(shifts: ScheduleShift[]) {
  return shifts.some(shift => shift.startTime <= '10:00' && shift.endTime >= '19:00') ? 'Covered' : 'Review gaps'
}

export function googleLink(shift: ScheduleShift | undefined, store: Store) {
  if (!shift) return 'https://calendar.google.com'
  const start = `${shift.businessDate.replaceAll('-', '')}T${shift.startTime.replace(':', '')}00`
  const end = `${shift.businessDate.replaceAll('-', '')}T${shift.endTime.replace(':', '')}00`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Montana PQH - ${store.name} Shift`)}&dates=${start}/${end}&location=${encodeURIComponent(store.address)}`
}
