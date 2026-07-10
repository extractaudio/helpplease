import { metricLabels, storeName } from '@/data'
import { addMetrics, currentMonth, statusFor } from '@/domain/metrics'
import { metricKeys } from '@/domain/types'
import { PageIntro } from '@/shared/ui'
import type { AppState, UserProfile } from '@/domain/types'

export function Dashboard({ state, user, isManager }: { state: AppState; user: UserProfile; isManager: boolean }) {
  const month = currentMonth()
  const people = isManager
    ? state.profiles.filter(profile => profile.status === 'active' && (user.role === 'area_manager' || profile.storeId === user.storeId))
    : [user]
  const rows = people.map(person => {
    const actual = addMetrics(state.entries.filter(entry => entry.employeeId === person.uid && entry.businessDate.startsWith(month)).map(entry => entry.metrics))
    const goal = state.goals.find(item => item.employeeId === person.uid && item.monthKey === month)?.targets
    return { person, actual, goal }
  })
  return (
    <section className="page">
      <PageIntro
        eyebrow="CRICKET MONTANA"
        title="Performance dashboard"
        text={`${month} · ${isManager ? user.role === 'area_manager' ? 'All stores' : storeName(user.storeId) : 'Your performance'}`}
      />
      <div className="summary-banner">
        <span className="live-dot">Live totals</span>
        <b>{rows.reduce((sum, row) => sum + row.actual.grossAdds, 0)} gross adds</b>
        <span>{rows.reduce((sum, row) => sum + row.actual.homeInternet, 0)} Home Internet</span>
      </div>
      <div className="performance-table">
        <div className="table-head">
          <span>Employee</span>
          <span>Gross adds</span>
          <span>Upgrades</span>
          <span>Internet</span>
          <span>Goal pace</span>
        </div>
        {rows.map(({ person, actual, goal }) => {
          const status = statusFor(actual.grossAdds, goal?.grossAdds || 0)
          const pct = goal?.grossAdds ? Math.round(actual.grossAdds / goal.grossAdds * 100) : 0
          return (
            <div className="table-row" key={person.uid}>
              <span><b>{person.fullName}</b><small>{storeName(person.storeId)}</small></span>
              <b>{actual.grossAdds}</b>
              <b>{actual.upgrades}</b>
              <b>{actual.homeInternet}</b>
              <span className={`pace ${status}`}>{goal ? `${pct}% · ${status === 'green' ? 'On pace' : status === 'yellow' ? 'Watch' : 'Behind'}` : 'No goal'}</span>
            </div>
          )
        })}
      </div>
      <div className="goal-cards">
        {metricKeys.slice(0, 6).map(key => {
          const actual = addMetrics(rows.map(row => row.actual))[key]
          const target = rows.reduce((sum, row) => sum + (row.goal?.[key] || 0), 0)
          const pct = target ? Math.round(actual / target * 100) : 0
          return (
            <div className="goal-card" key={key}>
              <span>{metricLabels[key]}</span>
              <b>{actual} <small>/ {target || '—'}</small></b>
              <div className="progress"><i style={{ width: `${Math.min(pct, 100)}%` }}/></div>
              <small className={statusFor(actual, target)}>{target ? `${pct}% to goal` : 'No goal set'}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}
