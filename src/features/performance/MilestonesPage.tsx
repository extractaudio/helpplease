import { CheckCircle2 } from 'lucide-react'
import { zeroMetrics } from '@/data'
import { currentBusinessDate, dollars, payoutFor } from '@/domain/metrics'
import { PageIntro } from '@/shared/ui'
import type { AppState, DailyEntry, MetricKey, UserProfile } from '@/domain/types'

export function MilestonesPage({ state, user, onSave }: { state: AppState; user: UserProfile; onSave: (entry: DailyEntry) => void }) {
  const date = currentBusinessDate()
  const existing = state.entries.find(entry => entry.employeeId === user.uid && entry.businessDate === date)
  const metrics = existing?.metrics || zeroMetrics()
  const payout = payoutFor(metrics, state.rules)
  const mark = (key: MetricKey, threshold: number) =>
    onSave({ id: `${user.uid}_${date}`, employeeId: user.uid, storeId: user.storeId, businessDate: date, metrics: { ...metrics, [key]: Math.max(metrics[key], threshold) }, notes: existing?.notes || '', updatedBy: user.uid, updatedAt: new Date().toISOString() })
  const completed = state.rules.filter(rule => metrics[rule.metric] >= rule.threshold).length
  return (
    <section className="page">
      <PageIntro eyebrow="DAILY PAYOUT CHECKLIST" title="Milestone sheet" text={`${date} · ${completed} of ${state.rules.length} items complete`}/>
      <div className="milestone-layout">
        <div className="payout-card">
          <span>Estimated fixed payout</span>
          <strong>{dollars(payout)}</strong>
          <small>Accessories are shown separately as a commission band.</small>
          <div className="progress big"><i style={{ width: `${completed / state.rules.length * 100}%` }}/></div>
          <b>{completed} complete · {state.rules.length - completed} remaining</b>
        </div>
        <div className="checklist">
          {state.rules.map(rule => {
            const done = metrics[rule.metric] >= rule.threshold
            return (
              <button className={done ? 'check-item done' : 'check-item'} key={rule.id} onClick={() => !done && mark(rule.metric, rule.threshold)}>
                <span>{done ? <CheckCircle2/> : <span className="empty-check"/>}</span>
                <span><b>{rule.label}</b><small>{rule.fixedPayoutCents ? dollars(rule.fixedPayoutCents) : rule.commissionBand}</small></span>
                {!done && <span className="quick-add">Tap to mark</span>}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
