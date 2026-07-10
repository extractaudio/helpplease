import { metricLabels } from '@/data'
import { statusFor } from '@/domain/metrics'
import { metricKeys } from '@/domain/types'
import type { Metrics } from '@/domain/types'

export function GoalReadout({ targets, actual }: { targets: Metrics; actual: Metrics }) {
  return (
    <div className="goal-cards">
      {metricKeys.map(key => {
        const target = targets[key]
        const pct = target ? Math.round(actual[key] / target * 100) : 0
        return (
          <div className="goal-card" key={key}>
            <span>{metricLabels[key]}</span>
            <b>{actual[key]} <small>/ {target || '—'}</small></b>
            <div className="progress"><i style={{ width: `${Math.min(pct, 100)}%` }}/></div>
            <small className={statusFor(actual[key], target)}>{target ? `${pct}% to goal` : 'No goal set'}</small>
          </div>
        )
      })}
    </div>
  )
}
