export function Stat({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone?: string }) {
  return (
    <div className={'stat-card ' + (tone || '')}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}
