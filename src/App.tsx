import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { signOutUser } from './auth'
import { LoadingCard, Onboarding, Welcome } from './app/EntryScreens'
import { useApplicationState } from './app/useApplicationState'
import { NavButton, nav, SideNav, type Page } from './components/navigation'
import { firebaseEnabled } from './firebase'
import { addMetrics, currentMonth } from './logic'
import { nextEntryMode, type EntryMode } from './entry-mode'
import { Dashboard, DailyPage, GoalsPage, HomePage, Leaderboard, MilestonesPage } from './features/performance/PerformancePages'
import { MySchedulePage, StoreOpenPage, StoreSchedulePage } from './features/schedule/SchedulePages'
import { EmployeesPage, ProfilePage } from './features/admin/AdministrationPages'

const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2)

export default function App() {
  const [entryMode, setEntryMode] = useState<EntryMode>('welcome')
  const { state, update, session, remote } = useApplicationState(entryMode === 'live')
  const [page, setPage] = useState<Page>('home'); const [drawer, setDrawer] = useState(false)
  const user = state.profiles.find(profile => profile.uid === state.currentUserId) || state.profiles[0]
  const isManager = user.role !== 'employee'; const isArea = user.role === 'area_manager'; const month = currentMonth()
  const myActuals = addMetrics(state.entries.filter(entry => entry.employeeId === user.uid && entry.businessDate.startsWith(month)).map(entry => entry.metrics)); const myGoal = state.goals.find(goal => goal.employeeId === user.uid && goal.monthKey === month)
  const selectPage = (next: Page) => { setPage(next); setDrawer(false) }

  if (entryMode === 'welcome') return <Welcome hasLiveSession={Boolean(session.user)} liveEnabled={firebaseEnabled} onDemo={() => setEntryMode(nextEntryMode('welcome', 'demo'))} onLive={() => setEntryMode(nextEntryMode('welcome', 'live'))}/>
  if (entryMode === 'live' && !firebaseEnabled) return <Welcome hasLiveSession={false} liveEnabled={false} onDemo={() => setEntryMode('demo')} onLive={() => undefined}/>
  if (entryMode === 'live' && session.user === undefined) return <LoadingCard label="Checking secure sign-in…"/>
  if (entryMode === 'live' && !session.user) return <Welcome hasLiveSession={false} liveEnabled onDemo={() => setEntryMode('demo')} onLive={() => setEntryMode('live')} showSignIn/>
  if (entryMode === 'live' && remote.profile === undefined) return <LoadingCard label="Loading your profile…"/>
  if (entryMode === 'live' && session.user && !remote.profile) return <Onboarding userId={session.user.uid} email={session.user.email || ''} name={session.user.displayName || ''}/>
  if (entryMode === 'live' && !remote.data) return <LoadingCard label="Syncing live workspace…"/>

  return <div className="app-shell"><header className="topbar"><button className="brand" onClick={() => selectPage('home')} aria-label="Go home"><span className="brand-mark">PQH</span><span>Montana <b>Team</b></span></button><nav className="desktop-nav">{nav.slice(0, 3).map(item => <NavButton key={item.page} item={item} active={page === item.page} onClick={selectPage}/>)}</nav><div className="profile-menu"><span className="avatar">{initials(user.fullName)}</span><button onClick={() => selectPage('profile')}><b>{user.fullName}</b><small>{user.status === 'active' ? user.jobTitle : 'Awaiting approval'}</small></button></div><button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu/></button></header>{drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}><aside className="drawer" onClick={event => event.stopPropagation()}><button className="icon-button close" onClick={() => setDrawer(false)}><X/></button><SideNav page={page} onClick={selectPage} isManager={isManager}/></aside></div>}<aside className="sidebar"><SideNav page={page} onClick={selectPage} isManager={isManager}/></aside><main>{page === 'home' && <HomePage user={user} actuals={myActuals} goal={myGoal?.targets} setPage={selectPage} isManager={isManager}/>} {page === 'daily' && <DailyPage user={user} entries={state.entries} onSave={entry => update(current => ({ ...current, entries: [...current.entries.filter(item => item.id !== entry.id), entry] }))}/>} {page === 'dashboard' && <Dashboard state={state} user={user} isManager={isManager}/>} {page === 'goals' && <GoalsPage state={state} user={user} onChange={update} isManager={isManager}/>} {page === 'milestones' && <MilestonesPage state={state} user={user} onSave={entry => update(current => ({ ...current, entries: [...current.entries.filter(item => item.id !== entry.id), entry] }))}/>} {page === 'leaderboard' && <Leaderboard state={state}/>} {page === 'schedule' && <MySchedulePage state={state} user={user} onChange={update}/>} {page === 'storeSchedule' && <StoreSchedulePage state={state} user={user}/>} {page === 'open' && <StoreOpenPage shifts={state.shifts}/>} {page === 'employees' && <EmployeesPage state={state} user={user} onChange={update} isArea={isArea}/>} {page === 'profile' && <ProfilePage user={user} trusted={state.trustedDevice} onChange={(profile, trusted) => update(current => ({ ...current, trustedDevice: trusted, profiles: current.profiles.map(item => item.uid === profile.uid ? profile : item) }))} onSignOut={() => { if (entryMode === 'demo') { setEntryMode(nextEntryMode('demo', 'leave')); return }; void signOutUser().finally(() => setEntryMode('welcome')) }}/>}</main><nav className="bottom-nav">{nav.slice(0, 5).map(item => <NavButton key={item.page} item={item} active={page === item.page} onClick={selectPage}/>)}</nav></div>
}
