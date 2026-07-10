export function LoadingCard({ label }: { label: string }) {
  return (
    <div className="sign-in">
      <div className="sign-card">
        <span className="brand-mark">PQH</span>
        <h1>{label}</h1>
        <p>Montana PQH Team is preparing your secure workspace.</p>
      </div>
    </div>
  )
}
