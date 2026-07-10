import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { storeName } from '@/data'
import { PageIntro } from '@/shared/ui'
import type { UserProfile } from '@/domain/types'

export function ProfilePage({ user, trusted, onChange, onSignOut }: { user: UserProfile; trusted: boolean; onChange: (profile: UserProfile, trusted: boolean) => void; onSignOut: () => void }) {
  const [profile, setProfile] = useState(user)
  return (
    <section className="page">
      <PageIntro eyebrow="SECURE ACCOUNT" title="My profile" text="Your contact details are visible only to authorized managers."/>
      <div className="form-card profile-form">
        <label>Full name<input value={profile.fullName} onChange={event => setProfile({ ...profile, fullName: event.target.value })}/></label>
        <label>Cell phone<input value={profile.cellPhone} onChange={event => setProfile({ ...profile, cellPhone: event.target.value })}/></label>
        <label>Work email<input type="email" value={profile.workEmail} onChange={event => setProfile({ ...profile, workEmail: event.target.value })}/></label>
        <label>Job title<input value={profile.jobTitle} onChange={event => setProfile({ ...profile, jobTitle: event.target.value })}/></label>
        <label>Store<input value={storeName(profile.storeId)} disabled/></label>
        <div className="trusted">
          <input id="trusted" type="checkbox" checked={trusted} onChange={event => onChange(profile, event.target.checked)}/>
          <label htmlFor="trusted">
            <b>This is a trusted device</b>
            <span>Enable local offline cache for this signed-in device.</span>
          </label>
        </div>
        <div className="form-footer">
          <button className="secondary danger" onClick={onSignOut}><LogOut size={17}/> Sign out</button>
          <button className="primary" onClick={() => onChange(profile, trusted)}>Save profile</button>
        </div>
      </div>
    </section>
  )
}
