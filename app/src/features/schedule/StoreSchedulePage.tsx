import { useState } from 'react'
import { stores } from '@/data'
import { currentBusinessDate } from '@/domain/metrics'
import { hoursFor } from '@/domain/schedule'
import { PageIntro, Stat } from '@/shared/ui'
import { ShiftCard } from './ShiftCard'
import { coverageLabel, currentTime } from './helpers'
import type { AppState, UserProfile } from '@/domain/types'

export function StoreSchedulePage({ state, user }: { state: AppState; user: UserProfile }) {
  const allowed = user.role === 'area_manager' ? stores : stores.filter(store => store.id === user.storeId)
  const [storeId, setStoreId] = useState(allowed[0].id)
  const [date, setDate] = useState(currentBusinessDate())
  const shifts = state.shifts
    .filter(shift => shift.storeId === storeId && shift.businessDate === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const total = shifts.reduce((sum, shift) => sum + hoursFor(shift), 0)
  const current = shifts.find(shift => shift.startTime <= currentTime() && shift.endTime > currentTime())

  return (
    <section className="page">
      <PageIntro
        eyebrow="TEAM COVERAGE"
        title="Store Schedule"
        text="Daily coverage, labor, and employee schedules."
        actions={(
          <>
            <select className="select" value={storeId} onChange={event => setStoreId(event.target.value as typeof storeId)}>
              {allowed.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
            <input className="date-input" type="date" value={date} onChange={event => setDate(event.target.value)}/>
          </>
        )}
      />
      <div className="stat-grid">
        <Stat label="Scheduled today" value={shifts.length} detail="Active shifts"/>
        <Stat label="Labor hours" value={total.toFixed(1)} detail="Scheduled coverage"/>
        <Stat label="Current worker" value={current?.employeeName || 'None'} detail={current ? `${current.startTime}–${current.endTime}` : 'No active shift'}/>
        <Stat label="Coverage" value={coverageLabel(shifts)} detail="Published store hours"/>
      </div>
      <div className="shift-list">
        {shifts.length ? (
          shifts.map(shift => <ShiftCard key={shift.id} shift={shift} store={stores.find(item => item.id === shift.storeId)!} today={date}/>)
        ) : (
          <div className="empty-card">No shifts scheduled.</div>
        )}
      </div>
    </section>
  )
}
