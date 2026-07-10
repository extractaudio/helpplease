import { useState } from 'react'
import { storeName, stores } from '@/data'
import { PageIntro } from '@/shared/ui'
import type { AppState, Role, StoreId, UserProfile } from '@/domain/types'

const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2)

export function EmployeesPage({ state, user, onChange, isArea }: { state: AppState; user: UserProfile; onChange: (change: (state: AppState) => AppState) => void; isArea: boolean }) {
  const visible = state.profiles.filter(profile => user.role === 'area_manager' || profile.storeId === user.storeId)
  const blank = (): UserProfile => ({ uid: `pending_${crypto.randomUUID()}`, fullName: '', workEmail: '', personalGoogleEmail: '', cellPhone: '', jobTitle: '', storeId: user.storeId, role: 'employee', status: 'pending' })
  const [draft, setDraft] = useState<UserProfile>(blank())
  const toggle = (profile: UserProfile) =>
    onChange(current => ({ ...current, profiles: current.profiles.map(item => item.uid === profile.uid ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item) }))
  const save = () => {
    if (!draft.fullName.trim() || !draft.workEmail.trim() || !draft.cellPhone.trim() || !draft.jobTitle.trim()) return
    onChange(current => ({ ...current, profiles: [...current.profiles.filter(profile => profile.uid !== draft.uid), draft] }))
    setDraft(blank())
  }

  return (
    <section className="page">
      <PageIntro eyebrow="ADMINISTRATION" title="Employee setup" text={isArea ? 'All stores · manage access and roles' : `${storeName(user.storeId)} · manage your team`}/>
      <div className="form-card profile-form">
        <label>Full name<input value={draft.fullName} onChange={event => setDraft({ ...draft, fullName: event.target.value })}/></label>
        <label>Work email<input type="email" value={draft.workEmail} onChange={event => setDraft({ ...draft, workEmail: event.target.value })}/></label>
        <label>Cell phone<input type="tel" value={draft.cellPhone} onChange={event => setDraft({ ...draft, cellPhone: event.target.value })}/></label>
        <label>Job title<input value={draft.jobTitle} onChange={event => setDraft({ ...draft, jobTitle: event.target.value })}/></label>
        <label>Store<select disabled={!isArea} value={draft.storeId} onChange={event => setDraft({ ...draft, storeId: event.target.value as StoreId })}>{stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
        {isArea && (
          <label>Role<select value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as Role })}>
            <option value="employee">Employee</option>
            <option value="store_manager">Store manager</option>
            <option value="area_manager">Area manager</option>
          </select></label>
        )}
        <button className="primary" onClick={save}>Save employee</button>
      </div>
      <div className="employee-list">
        {visible.map(profile => (
          <div className="employee-card" key={profile.uid}>
            <span className="avatar">{initials(profile.fullName)}</span>
            <span>
              <b>{profile.fullName}</b>
              <small>{profile.jobTitle} · {storeName(profile.storeId)}</small>
              <small>{profile.workEmail}</small>
            </span>
            <span className={`status ${profile.status}`}>{profile.status}</span>
            {profile.uid !== user.uid && (
              <>
                <button className="secondary compact" onClick={() => setDraft(profile)}>Edit</button>
                <button className="secondary compact" onClick={() => toggle(profile)}>{profile.status === 'active' ? 'Deactivate' : 'Activate'}</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
