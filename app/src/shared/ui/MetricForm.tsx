import { metricLabels } from '@/data'
import { metricKeys } from '@/domain/types'
import type { MetricKey, Metrics } from '@/domain/types'

export function MetricForm({ metrics, onChange }: { metrics: Metrics; onChange: (key: MetricKey, value: string) => void }) {
  return (
    <div className="metric-form">
      {metricKeys.map(key => (
        <label key={key}>
          <span>{metricLabels[key]}</span>
          <input
            aria-label={metricLabels[key]}
            type="number"
            min="0"
            inputMode="numeric"
            value={metrics[key]}
            onChange={e => onChange(key, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}
