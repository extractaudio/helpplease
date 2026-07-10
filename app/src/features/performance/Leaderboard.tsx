import { useState } from 'react'
import { metricLabels, stores } from '@/data'
import { addMetrics, currentMonth } from '@/domain/metrics'
import { PageIntro } from '@/shared/ui'
import type { AppState, MetricKey } from '@/domain/types'

export function Leaderboard({ state }: { state: AppState }) {
  const [metric, setMetric] = useState<MetricKey>('homeInternet')
  const month = currentMonth()
  const rows = stores
    .map(store => ({
      store,
      value: addMetrics(state.entries.filter(entry => entry.storeId === store.id && entry.businessDate.startsWith(month)).map(entry => entry.metrics))[metric]
    }))
    .sort((a, b) => b.value - a.value || a.store.name.localeCompare(b.store.name))
  return (
    <section className="page">
      <PageIntro
        eyebrow="ALL FIVE STORES"
        title="Store leaderboard"
        text={`${month} · Live performance ranking`}
        actions={(
          <select className="select" value={metric} onChange={event => setMetric(event.target.value as MetricKey)}>
            {['homeInternet', 'grossAdds', 'upgrades', 'accessories', 'upgradePlus', 'milestoneSheets'].map(key => (
              <option key={key} value={key}>{metricLabels[key as MetricKey]}</option>
            ))}
          </select>
        )}
      />
      <div className="leaderboard">
        {rows.map((row, index) => {
          const rank = index > 0 && row.value === rows[index - 1].value ? rows.findIndex(item => item.value === row.value) + 1 : index + 1
          return (
            <div className="leader-row" key={row.store.id}>
              <strong className={rank < 4 ? 'rank top' : 'rank'}>{rank}</strong>
              <span><b>{row.store.name}</b><small>{row.store.phone}</small></span>
              <strong>{row.value}</strong>
            </div>
          )
        })}
      </div>
    </section>
  )
}
