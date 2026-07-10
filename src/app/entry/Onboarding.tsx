import { useState } from 'react'
import { stores } from '@/data'
import { saveProfile } from '@/services/repository'
import type { StoreId, UserProfile } from '@/domain/types'

export function Onboarding({ userId, email, name }: { userId: string; email: string; name: string }) {
  const [profile, setProfile] = useState<UserProfile>({ uid: userId, fullName: name, workEmail: email, personalGoogleEmail: email, cellPhone: '', jobTitle: '', storeId: 'helena', role: 'employee', status: 'pending' })
  const [saving, setSaving] = useState(false)
  const ready = profile.fullName.trim() && profile.workEmail.trim() && profile.cellPhone.trim() && profile.jobTitle.trim()
  const submit = async () => {
    if (!ready) return
    setSaving(true)
    try {
      await saveProfile(profile)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="sign-in">
      <div className="sign-card">
        <span className="brand-mark">PQH</span>
        <p className="eyebrow">PROFILE SETUP</p>
        <h1>Welcome to the team.</h1>
        <p>Complete your work profile. A manager will confirm your store and access level.</p>
        <div className="profile-form">
          <label>Full name<input value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })}/></label>
          <label>Cell phone<input type="tel" value={profile.cellPhone} onChange={e => setProfile({ ...profile, cellPhone: e.target.value })}/></label>
          <label>Work email<input type="email" value={profile.workEmail} onChange={e => setProfile({ ...profile, workEmail: e.target.value })}/></label>
          <label>Google email<input type="email" value={profile.personalGoogleEmail} disabled/></label>
          <label>Job title<input value={profile.jobTitle} onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}/></label>
          <label>Store<select value={profile.storeId} onChange={e => setProfile({ ...profile, storeId: e.target.value as StoreId })}>{stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
          <button className="primary wide" disabled={!ready || saving} onClick={() => void submit()}>{saving ? 'Saving…' : 'Submit profile for approval'}</button>
        </div>
      </div>
    </div>
  )
}
