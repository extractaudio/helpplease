import { ShieldCheck } from 'lucide-react'
import { PageIntro } from './PageIntro'

export function PendingCard() {
  return (
    <section className="page">
      <PageIntro
        eyebrow="ACCOUNT REVIEW"
        title="You’re almost ready"
        text="A store manager needs to activate this profile before daily entries are available."
      />
      <div className="empty-card">
        <ShieldCheck size={34}/>
        <h2>Pending manager approval</h2>
        <p>Your profile is saved and secure. Check back after your manager confirms your store and role.</p>
      </div>
    </section>
  )
}
