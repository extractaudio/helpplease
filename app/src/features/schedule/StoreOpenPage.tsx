import { stores } from '@/data'
import { storeStatusAt } from '@/domain/store-hours'
import { PageIntro } from '@/shared/ui'
import type { ScheduleShift } from '@/domain/types'

export function StoreOpenPage({ shifts }: { shifts: ScheduleShift[] }) {
  const now = new Date()
  return (
    <section className="page">
      <PageIntro eyebrow="LIVE OPERATIONS" title="Store open dashboard" text="Current Montana store status and scheduled coverage."/>
      <div className="feature-grid">
        {stores.map(store => {
          const status = storeStatusAt(store.id, now, shifts)
          return (
            <article className="feature-card" key={store.id}>
              <span className={`status ${status.isOpen ? 'active' : 'inactive'}`}>{status.isOpen ? 'Open now' : 'Closed now'}</span>
              <b>{store.name}</b>
              <small>{status.opensAt}–{status.closesAt} MT</small>
              <small>{status.currentWorkers.length ? `Working now: ${status.currentWorkers.join(', ')}` : 'No current shift worker'}</small>
              <small>{status.scheduledEmployees.length} scheduled today</small>
              <a href={`tel:${store.phone}`}>Call store</a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
