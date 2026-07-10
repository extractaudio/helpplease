import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { storeName, zeroMetrics } from '@/data'
import { currentBusinessDate } from '@/domain/metrics'
import { MetricForm, PageIntro, PendingCard } from '@/shared/ui'
import type { DailyEntry, MetricKey, Metrics, UserProfile } from '@/domain/types'

export function DailyPage({ user, entries, onSave }: { user: UserProfile; entries: DailyEntry[]; onSave: (entry: DailyEntry) => void }) {
  const date = currentBusinessDate()
  const existing = entries.find(entry => entry.employeeId === user.uid && entry.businessDate === date)
  const [metrics, setMetrics] = useState<Metrics>(existing?.metrics || zeroMetrics())
  const [notes, setNotes] = useState(existing?.notes || '')
  const [saved, setSaved] = useState(false)
  const change = (key: MetricKey, value: string) => setMetrics(current => ({ ...current, [key]: Math.max(0, Number(value) || 0) }))
  const save = () => {
    onSave({ id: `${user.uid}_${date}`, employeeId: user.uid, storeId: user.storeId, businessDate: date, metrics, notes, updatedBy: user.uid, updatedAt: new Date().toISOString() })
    setSaved(true)
  }
  if (user.status !== 'active') return <PendingCard />
  return (
    <section className="page">
      <PageIntro eyebrow="DAILY PERFORMANCE" title="Enter today’s numbers" text={`${storeName(user.storeId)} · ${date}`}/>
      <div className="form-card">
        <div className="locked-row">
          <span><b>{user.fullName}</b><small>Employee</small></span>
          <span><b>{storeName(user.storeId)}</b><small>Locked store</small></span>
          <span><b>{date}</b><small>Montana business date</small></span>
        </div>
        <MetricForm metrics={metrics} onChange={change}/>
        <label className="notes-label">Notes<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Wins, coaching needs, or context for today…"/></label>
        <div className="form-footer">
          <span>{existing ? 'Updating an existing entry. Changes are audited.' : 'Your entry becomes live after saving.'}</span>
          <button className="primary" onClick={save}>{saved ? <><CheckCircle2 size={18}/> Saved live</> : 'Save daily numbers'}</button>
        </div>
      </div>
    </section>
  )
}
