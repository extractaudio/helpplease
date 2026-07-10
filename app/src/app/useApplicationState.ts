import { useEffect, useState } from 'react'
import { hydrateAppState, storesForDisplay } from '@/domain/app-state'
import { initialState } from '@/data'
import { firebaseEnabled } from '@/services/firebase'
import { saveEntry, saveGoal, saveNotification, saveProfile, saveStore } from '@/services/repository'
import { useFirebaseSession, useRemoteData } from '@/services/useAppData'
import type { AppState } from '@/domain/types'

const storageKey = 'pqh-team-demo-v1'

function useDemoState() {
  const [state, setState] = useState<AppState>(() => { try { return hydrateAppState(JSON.parse(localStorage.getItem(storageKey) || '')) } catch { return initialState } })
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(state)) }, [state])
  return [state, setState] as const
}

export function useApplicationState(liveAccess: boolean) {
  const [demo, setDemo] = useDemoState(); const session = useFirebaseSession(); const remote = useRemoteData(session.user)
  // Single source of truth for "a live session is fully loaded" -- state selection and the
  // write-target decision in update() must always agree, or writes can reach the wrong store.
  const liveReady = liveAccess && firebaseEnabled && Boolean(session.user) && Boolean(remote.profile) && Boolean(remote.data)
  const state = liveReady && remote.profile && remote.data
    ? { ...demo, ...remote.data, stores: storesForDisplay(remote.data.stores), currentUserId: remote.profile.uid }
    : demo
  const changed = <T, K extends keyof T>(before: T[], after: T[], id: K) => after.filter(value => JSON.stringify(value) !== JSON.stringify(before.find(item => item[id] === value[id])))
  const update = (fn: (value: AppState) => AppState) => {
    const next = fn(state)
    if (!liveReady) { setDemo(next); return }
    void Promise.all([
      ...changed(state.profiles, next.profiles, 'uid').map(saveProfile),
      ...changed(state.entries, next.entries, 'id').map(saveEntry),
      ...changed(state.goals, next.goals, 'id').map(saveGoal),
      ...changed(state.notifications, next.notifications, 'id').map(saveNotification),
      ...changed(state.stores, next.stores, 'id').map(saveStore)
    ])
  }
  return { state, update, session, remote }
}
