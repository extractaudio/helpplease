import { useState } from 'react'
import { Bell, CalendarDays, Download, ExternalLink } from 'lucide-react'
import { storeName, stores } from '@/data'
import { currentBusinessDate } from '@/domain/metrics'
import { hoursFor, toIcs } from '@/domain/schedule'
import { storeStatusAt } from '@/domain/store-hours'
import { PageIntro, Stat } from '@/shared/ui'
import { ShiftCard } from './ShiftCard'
import { filteredView, googleLink } from './helpers'
import type { AppState, ScheduleShift, UserProfile } from '@/domain/types'

export function MySchedulePage({ state, user, onChange }: { state: AppState; user: UserProfile; onChange: (change: (state: AppState) => AppState) => void }) {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const today = currentBusinessDate()
  const mine = state.shifts
    .filter(shift => shift.employeeId === user.uid)
    .sort((a, b) => `${a.businessDate}${a.startTime}`.localeCompare(`${b.businessDate}${b.startTime}`))
  const upcoming = mine.filter(shift => shift.businessDate >= today)
  const next = upcoming[0]
  const weekHours = filteredView(mine, 'weekly', today).reduce((sum, shift) => sum + hoursFor(shift), 0)
  const monthHours = mine
    .filter(shift => shift.businessDate.startsWith(today.slice(0, 7)))
    .reduce((sum, shift) => sum + hoursFor(shift), 0)
  const store = stores.find(item => item.id === user.storeId)!
  const isStoreOpen = storeStatusAt(user.storeId, new Date(), state.shifts).isOpen
  const shownShifts = filteredView(mine, view, today)
  const notices = state.notifications.filter(notice => notice.employeeId === user.uid && !notice.read)
  const download = (selection: ScheduleShift[]) => {
    const blob = new Blob([toIcs(selection, stores)], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'montana-pqh-schedule.ics'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="page">
      <PageIntro
        eyebrow="CRICKET MONTANA"
        title="My Schedule"
        text="Matched to your work email and assigned store."
        actions={<span className="live-dot">Live across 5 stores</span>}
      />
      {notices.length > 0 && (
        <button
          className="notice-banner"
          onClick={() => onChange(current => ({ ...current, notifications: current.notifications.map(notice => notice.employeeId === user.uid ? { ...notice, read: true } : notice) }))}
        >
          <Bell size={17}/>{notices.length} schedule update{notices.length > 1 ? 's' : ''} · Tap to mark read
        </button>
      )}
      <div className="stat-grid schedule-stats">
        <Stat label="Next shift" value={next ? `${next.businessDate} · ${next.startTime}` : 'None'} detail={next ? `${next.jobTitle} · ${storeName(next.storeId)}` : 'No upcoming shifts'}/>
        <Stat label="Hours this week" value={weekHours.toFixed(1)} detail="Scheduled hours"/>
        <Stat label="Hours this month" value={monthHours.toFixed(1)} detail="Scheduled hours"/>
        <Stat label="Store status" value={isStoreOpen ? 'Open' : 'Closed'} detail={next ? `${storeName(next.storeId)} shift` : 'Published hours'}/>
      </div>
      <div className="schedule-toolbar">
        <div className="view-switch">
          {(['weekly', 'daily', 'monthly'] as const).map(item => (
            <button className={view === item ? 'selected' : ''} key={item} onClick={() => setView(item)}>{item}</button>
          ))}
        </div>
        <div className="button-row">
          <button className="primary" onClick={() => download(upcoming.filter(shift => shift.businessDate === today))}><Download size={16}/> Import Today</button>
          <button className="secondary" onClick={() => download(upcoming.filter(shift => shift.businessDate.startsWith(today.slice(0, 7))))}>Import Month</button>
          <button className="secondary" onClick={() => window.open(googleLink(next, store), '_blank')}>Google Calendar <ExternalLink size={15}/></button>
        </div>
      </div>
      <div className="shift-list">
        {shownShifts.length ? (
          shownShifts.map(shift => (
            <ShiftCard key={shift.id} shift={shift} store={stores.find(item => item.id === shift.storeId)!} today={today}/>
          ))
        ) : (
          <div className="empty-card">
            <CalendarDays size={34}/>
            <h2>No matching shifts</h2>
            <p>Confirm that your work email and store match the App Schedule tab.</p>
          </div>
        )}
      </div>
    </section>
  )
}
