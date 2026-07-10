import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { metricLabels } from '../data'
import { metricKeys } from '../types'
import type { MetricKey, Metrics } from '../types'

export function Stat({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone?: string }) { return <div className={'stat-card ' + (tone || '')}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
export function MetricForm({ metrics, onChange }: { metrics: Metrics; onChange: (key: MetricKey, value: string) => void }) { return <div className="metric-form">{metricKeys.map(key => <label key={key}><span>{metricLabels[key]}</span><input aria-label={metricLabels[key]} type="number" min="0" inputMode="numeric" value={metrics[key]} onChange={e => onChange(key, e.target.value)}/></label>)}</div> }
export function PageIntro({ eyebrow, title, text, actions }: { eyebrow: string; title: string; text: string; actions?: React.ReactNode }) { return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{actions}</div> }
export function PendingCard() { return <section className="page"><PageIntro eyebrow="ACCOUNT REVIEW" title="You’re almost ready" text="A store manager needs to activate this profile before daily entries are available."/><div className="empty-card"><ShieldCheck size={34}/><h2>Pending manager approval</h2><p>Your profile is saved and secure. Check back after your manager confirms your store and role.</p></div></section> }
export { CheckCircle2 }
