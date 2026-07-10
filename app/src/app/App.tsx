import { useState } from 'react'
import { signOutUser } from '@/services/auth'
import { LoadingCard, Onboarding, Welcome } from '@/app/entry'
import { useApplicationState } from '@/app/useApplicationState'
import { AppShell } from '@/app/AppShell'
import { AppRouter } from '@/app/AppRouter'
import { firebaseEnabled } from '@/services/firebase'
import { currentMonth, monthlyActualsFor, monthlyGoalFor } from '@/domain/metrics'
import { nextEntryMode, type EntryMode } from '@/domain/entry-mode'
import type { Page } from '@/shared/navigation'
import type { StoreId } from '@/domain/types'

export default function App() {
  const [entryMode, setEntryMode] = useState<EntryMode>('welcome')
  const { state, update, session, remote } = useApplicationState(entryMode === 'live')
  const [page, setPage] = useState<Page>('home')
  const [scheduleStoreId, setScheduleStoreId] = useState<StoreId>()
  const user = state.profiles.find(profile => profile.uid === state.currentUserId) || state.profiles[0]

  if (!user) return <LoadingCard label={entryMode === 'live' ? 'Syncing live workspace…' : 'Preparing your workspace…'}/>

  const isManager = user.role !== 'employee'
  const isArea = user.role === 'area_manager'
  const month = currentMonth()
  const myActuals = monthlyActualsFor(state.entries, user.uid, month)
  const myGoal = monthlyGoalFor(state.goals, user.uid, month)

  const signOut = () => {
    if (entryMode === 'demo') { setEntryMode(nextEntryMode('demo', 'leave')); return }
    void signOutUser().finally(() => setEntryMode('welcome'))
  }

  const goToStoreSchedule = (storeId: StoreId) => {
    setScheduleStoreId(storeId)
    setPage('storeSchedule')
  }

  if (entryMode === 'welcome')
    return <Welcome hasLiveSession={Boolean(session.user)} liveEnabled={firebaseEnabled} onDemo={() => setEntryMode(nextEntryMode('welcome', 'demo'))} onLive={() => setEntryMode(nextEntryMode('welcome', 'live'))}/>
  if (entryMode === 'live' && !firebaseEnabled)
    return <Welcome hasLiveSession={false} liveEnabled={false} onDemo={() => setEntryMode('demo')} onLive={() => undefined}/>
  if (entryMode === 'live' && session.user === undefined)
    return <LoadingCard label="Checking secure sign-in…"/>
  if (entryMode === 'live' && !session.user)
    return <Welcome hasLiveSession={false} liveEnabled onDemo={() => setEntryMode('demo')} onLive={() => setEntryMode('live')} showSignIn/>
  if (entryMode === 'live' && remote.profile === undefined)
    return <LoadingCard label="Loading your profile…"/>
  if (entryMode === 'live' && session.user && !remote.profile)
    return <Onboarding userId={session.user.uid} email={session.user.email || ''} name={session.user.displayName || ''}/>
  if (entryMode === 'live' && !remote.data)
    return <LoadingCard label="Syncing live workspace…"/>

  return (
    <AppShell user={user} page={page} isManager={isManager} onSelectPage={setPage}>
      <AppRouter
        page={page}
        state={state}
        user={user}
        isManager={isManager}
        isArea={isArea}
        actuals={myActuals}
        goal={myGoal}
        scheduleStoreId={scheduleStoreId}
        selectPage={setPage}
        onScheduleStore={goToStoreSchedule}
        update={update}
        onSignOut={signOut}
      />
    </AppShell>
  )
}
