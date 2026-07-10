import { useState } from 'react'
import { CalendarDays, MapPin, MessageCircle, Pencil, Phone, X } from 'lucide-react'
import { PageIntro } from '../../components/ui'
import { canEditStore, mapHref, phoneHref } from '../../store-directory'
import { storeHoursSummary, storeStatusAt } from '../../store-hours'
import type { AppState, Store, StoreId, UserProfile } from '../../types'

type Props = {
  state: AppState
  user: UserProfile
  onChange: (change: (state: AppState) => AppState) => void
  onSchedule: (storeId: StoreId) => void
}

export function StoreDirectoryPage({ state, user, onChange, onSchedule }: Props) {
  const [draft, setDraft] = useState<Store | null>(null)
  const [error, setError] = useState('')
  const now = new Date()
  const openCount = state.stores.filter(store => storeStatusAt(store.id, now, state.shifts).isOpen).length

  const closeEditor = () => { setDraft(null); setError('') }
  const save = () => {
    if (!draft || !draft.name.trim() || !phoneHref(draft.phone, 'tel') || !draft.address.trim()) {
      setError('Name, phone, and address are required.')
      return
    }
    onChange(current => ({ ...current, stores: current.stores.map(store => store.id === draft.id ? draft : store) }))
    closeEditor()
  }

  return <section className="page directory-page">
    <PageIntro eyebrow="CRICKET MONTANA" title="Store directory" text="Call, navigate, or check today’s coverage." actions={<span className="live-dot">{openCount} open now</span>}/>
    <div className="directory-grid">
      {state.stores.map(store => {
        const status = storeStatusAt(store.id, now, state.shifts)
        const call = phoneHref(store.phone, 'tel')
        const message = phoneHref(store.phone, 'sms')
        const map = mapHref(store.address)
        return <article className={`directory-card operational-card bracket-accent ${status.isOpen ? 'is-open' : ''}`} key={store.id}>
          <div className="directory-card-top"><h2>{store.name}</h2><span className={`store-state ${status.isOpen ? 'open' : 'closed'}`}>{status.isOpen ? 'Open now' : 'Closed now'}</span></div>
          <p className="directory-address">{store.address}</p>
          <p className="directory-meta">{storeHoursSummary(status, now)} · {status.scheduledEmployees.length} scheduled</p>
          <p className="directory-workers">{status.currentWorkers.length ? `Working now: ${status.currentWorkers.join(', ')}` : 'No teammate currently clocked in'}</p>
          <div className="directory-actions">
            {call && <a className="primary" href={call}><Phone size={16}/> Call</a>}
            {map && <a className="secondary" href={map} target="_blank" rel="noreferrer"><MapPin size={16}/> Map</a>}
            {message && <a className="secondary directory-secondary-action" href={message}><MessageCircle size={16}/> Message</a>}
            <button className="secondary directory-secondary-action" onClick={() => onSchedule(store.id)}><CalendarDays size={16}/> Schedule</button>
            {canEditStore(user, store.id) && <button className="quiet-action" onClick={() => { setDraft({ ...store }); setError('') }}><Pencil size={15}/> Edit</button>}
          </div>
        </article>
      })}
    </div>
    {draft && <div className="store-dialog-backdrop" onClick={closeEditor}>
      <div className="store-dialog" role="dialog" aria-modal="true" aria-labelledby="store-dialog-title" onClick={event => event.stopPropagation()}>
        <div className="store-dialog-heading"><div><p className="eyebrow">STORE DETAILS</p><h2 id="store-dialog-title">Edit {draft.name}</h2></div><button className="icon-button" onClick={closeEditor} aria-label="Close store editor"><X/></button></div>
        <div className="store-dialog-form">
          <label>Store name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })}/></label>
          <label>Phone<input type="tel" value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })}/></label>
          <label>Address<input value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })}/></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="store-dialog-actions"><button className="secondary" onClick={closeEditor}>Cancel</button><button className="primary" onClick={save}>Save store</button></div>
      </div>
    </div>}
  </section>
}
