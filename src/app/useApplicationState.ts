import { useEffect, useState } from 'react'
import { initialState } from '../data'
import { firebaseEnabled } from '../firebase'
import { saveEntry, saveGoal, saveNotification, saveProfile } from '../repository'
import { useFirebaseSession, useRemoteData } from '../useAppData'
import type { AppState } from '../types'

const storageKey = 'pqh-team-demo-v1'

function useDemoState() {
  const [state, setState] = useState<AppState>(() => { try { return JSON.parse(localStorage.getItem(storageKey) || '') } catch { return initialState } })
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(state)) }, [state])
  return [state, setState] as const
}

export function useApplicationState(liveAccess: boolean) {
  const [demo, setDemo] = useDemoState(); const session = useFirebaseSession(); const remote = useRemoteData(session.user)
  const state = liveAccess && firebaseEnabled && session.user && remote.profile && remote.data ? { ...demo, ...remote.data, currentUserId: remote.profile.uid } : demo
  const changed = <T, K extends keyof T>(before: T[], after: T[], id: K) => after.filter(value => JSON.stringify(value) !== JSON.stringify(before.find(item => item[id] === value[id])))
  const update = (fn: (value: AppState) => AppState) => {
    const next = fn(state)
    if (!liveAccess || !firebaseEnabled || !session.user) { setDemo(next); return }
    void Promise.all([
      ...changed(state.profiles, next.profiles, 'uid').map(saveProfile),
      ...changed(state.entries, next.entries, 'id').map(saveEntry),
      ...changed(state.goals, next.goals, 'id').map(saveGoal),
      ...changed(state.notifications, next.notifications, 'id').map(saveNotification)
    ])
  }
  return { state, update, session, remote }
}
