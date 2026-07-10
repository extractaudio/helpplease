import { MapPin, Phone } from 'lucide-react'
import type { ScheduleShift, Store } from '@/domain/types'

export function ShiftCard({ shift, store, today }: { shift: ScheduleShift; store: Store; today: string }) {
  const tone = shift.businessDate < today ? 'completed' : shift.businessDate === today ? 'today' : 'upcoming'
  return (
    <article className={`shift-card ${tone}`}>
      <span className="shift-date"><b>{shift.businessDate}</b><small>{tone === 'today' ? 'Today' : tone}</small></span>
      <span>
        <b>{shift.startTime} – {shift.endTime}</b>
        <small>{shift.employeeName} · {shift.jobTitle}</small>
        {shift.notes && <small>{shift.notes}</small>}
      </span>
      <div>
        <a href={`tel:${store.phone}`} aria-label={`Call ${store.name}`}><Phone size={17}/></a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`} target="_blank" aria-label={`Map ${store.name}`}><MapPin size={17}/></a>
      </div>
    </article>
  )
}
