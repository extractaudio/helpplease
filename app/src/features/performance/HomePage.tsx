import { Plus, Target } from 'lucide-react'
import { storeName } from '@/data'
import { dollars } from '@/domain/metrics'
import { Stat } from '@/shared/ui'
import type { Page } from '@/shared/navigation'
import type { Metrics, UserProfile } from '@/domain/types'

export function HomePage({ user, actuals, goal, setPage, isManager }: { user: UserProfile; actuals: Metrics; goal?: Metrics; setPage: (page: Page) => void; isManager: boolean }) {
  const percent = goal ? Math.round((actuals.grossAdds / Math.max(goal.grossAdds, 1)) * 100) : 0
  const cards: { p: Page; t: string; d: string }[] = [
    { p: 'dashboard', t: 'Dashboard', d: 'Goals, totals, and pace' },
    { p: 'daily', t: 'Enter Daily Numbers', d: 'Log today’s performance' },
    { p: 'goals', t: 'Employee Goals', d: 'Monthly targets' },
    { p: 'milestones', t: 'Milestone Sheet', d: 'Complete today’s payout checklist' },
    { p: 'leaderboard', t: 'Store Leaderboard', d: 'See all five stores rank' },
    { p: 'open', t: 'Store Status', d: 'Live hours and staff' },
    { p: isManager ? 'employees' : 'profile', t: isManager ? 'Employee Setup' : 'My Profile', d: isManager ? 'Manage access and team' : 'Manage your contact details' }
  ]
  return (
    <section className="page home-page">
      <div className="hero">
        <div>
          <p className="eyebrow">PEOPLE · PERFORMANCE · RESULTS</p>
          <h1>Lead every store.<br/><em>Move every number.</em></h1>
          <p>One live command center for goals, daily performance, and payout milestones.</p>
          <div className="button-row">
            <button className="primary" onClick={() => setPage('daily')}><Plus size={18}/> Enter daily numbers</button>
            <button className="secondary" onClick={() => setPage('dashboard')}>View dashboard</button>
          </div>
        </div>
        <div className="hero-badge">
          <Target size={48}/>
          <b>Today’s focus</b>
          <span>Every entry moves the team.</span>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR MONTH</p>
          <h2>Hi, {user.fullName.split(' ')[0]}.</h2>
        </div>
        <span className="live-dot">Live across 5 stores</span>
      </div>
      <div className="stat-grid">
        <Stat label="Gross adds" value={actuals.grossAdds} detail={goal ? `${percent}% to goal` : 'Goal not set'} tone="lime"/>
        <Stat label="Home Internet" value={actuals.homeInternet} detail="This month"/>
        <Stat label="Milestone payout" value={dollars(0)} detail="Open milestones to estimate"/>
        <Stat label="Store" value={storeName(user.storeId)} detail={user.status === 'active' ? 'Active profile' : 'Approval needed'}/>
      </div>
      <div className="feature-grid">
        {cards.map((card, index) => (
          <button key={card.t} className="feature-card" onClick={() => setPage(card.p)}>
            <span className="feature-icon">{index + 1}</span>
            <b>{card.t}</b>
            <small>{card.d}</small>
            <span>→</span>
          </button>
        ))}
      </div>
    </section>
  )
}
