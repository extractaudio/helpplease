import { useEffect, useState } from 'react'
import { storeName, zeroMetrics } from '@/data'
import { addMetrics, currentMonth } from '@/domain/metrics'
import { MetricForm, PageIntro } from '@/shared/ui'
import { GoalReadout } from './GoalReadout'
import type { AppState, Metrics, UserProfile } from '@/domain/types'

export function GoalsPage({ state, user, onChange, isManager }: { state: AppState; user: UserProfile; onChange: (change: (state: AppState) => AppState) => void; isManager: boolean }) {
  const month = currentMonth()
  const available = isManager
    ? state.profiles.filter(profile => profile.status === 'active' && (user.role === 'area_manager' || profile.storeId === user.storeId))
    : [user]
  const [selected, setSelected] = useState(available[0]?.uid || user.uid)
  const employee = state.profiles.find(profile => profile.uid === selected)!
  const goal = state.goals.find(item => item.employeeId === selected && item.monthKey === month)
  const [targets, setTargets] = useState<Metrics>(goal?.targets || zeroMetrics())
  useEffect(
    () => setTargets(state.goals.find(item => item.employeeId === selected && item.monthKey === month)?.targets || zeroMetrics()),
    [selected, state.goals, month]
  )
  const save = () =>
    onChange(current => ({
      ...current,
      goals: [
        ...current.goals.filter(item => !(item.employeeId === selected && item.monthKey === month)),
        { id: `${selected}_${month}`, employeeId: selected, storeId: employee.storeId, monthKey: month, targets }
      ]
    }))
  const actual = addMetrics(state.entries.filter(entry => entry.employeeId === user.uid && entry.businessDate.startsWith(month)).map(entry => entry.metrics))
  return (
    <section className="page">
      <PageIntro
        eyebrow="MONTHLY TARGETS"
        title="Employee goals"
        text={isManager ? 'Set clear expectations for the current month.' : 'Your current monthly targets.'}
        actions={isManager ? (
          <select className="select" value={selected} onChange={event => setSelected(event.target.value)}>
            {available.map(profile => <option key={profile.uid} value={profile.uid}>{profile.fullName}</option>)}
          </select>
        ) : undefined}
      />
      <div className="form-card">
        <div className="locked-row">
          <span><b>{employee.fullName}</b><small>{storeName(employee.storeId)}</small></span>
          <span><b>{month}</b><small>Goal month</small></span>
        </div>
        {isManager ? (
          <>
            <MetricForm metrics={targets} onChange={(key, value) => setTargets(current => ({ ...current, [key]: Math.max(0, Number(value) || 0) }))}/>
            <div className="form-footer">
              <span>Targets are visible to this employee immediately.</span>
              <button className="primary" onClick={save}>Save monthly goals</button>
            </div>
          </>
        ) : (
          <GoalReadout targets={targets} actual={actual}/>
        )}
      </div>
    </section>
  )
}
