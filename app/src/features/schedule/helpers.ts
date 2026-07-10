import type { ScheduleShift, Store } from '@/domain/types'

export function currentTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
}

const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

export function filteredView(shifts: ScheduleShift[], view: 'daily' | 'weekly' | 'monthly', today: string) {
  return shifts.filter(shift =>
    view === 'daily'
      ? shift.businessDate === today
      : view === 'weekly'
        ? shift.businessDate >= today && shift.businessDate <= addDays(today, 6)
        : shift.businessDate.startsWith(today.slice(0, 7))
  )
}

export function googleLink(shift: ScheduleShift | undefined, store: Store) {
  if (!shift) return 'https://calendar.google.com'
  const start = `${shift.businessDate.replaceAll('-', '')}T${shift.startTime.replace(':', '')}00`
  const end = `${shift.businessDate.replaceAll('-', '')}T${shift.endTime.replace(':', '')}00`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Montana PQH - ${store.name} Shift`)}&dates=${start}/${end}&location=${encodeURIComponent(store.address)}`
}
