import { loadFirebase } from '@/services/firebase'
import type { DocumentData, Query, Unsubscribe } from 'firebase/firestore'
import type { DailyEntry, MonthlyGoal, ScheduleNotification, ScheduleShift, Store, StoreId, UserProfile } from '@/domain/types'

export type RemoteData = { profiles: UserProfile[]; entries: DailyEntry[]; goals: MonthlyGoal[]; shifts: ScheduleShift[]; notifications: ScheduleNotification[]; stores: Store[] }
export const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return ''
  const columns = Object.keys(rows[0])
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return [columns.join(','), ...rows.map(row => columns.map(column => quote(row[column])).join(','))].join('\r\n')
}
export function normalizeProfile(uid: string, value: Partial<UserProfile>): UserProfile {
  return { uid, fullName: value.fullName || '', workEmail: value.workEmail || '', personalGoogleEmail: value.personalGoogleEmail || '', cellPhone: value.cellPhone || '', jobTitle: value.jobTitle || '', storeId: (value.storeId || 'helena') as StoreId, role: value.role || 'employee', status: value.status || 'pending', createdAt: value.createdAt, updatedAt: value.updatedAt }
}
const documents = <T>(snapshot: { docs: { id: string; data: () => DocumentData }[] }) => snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as T)
const remoteEmpty = (): RemoteData => ({ profiles: [], entries: [], goals: [], shifts: [], notifications: [], stores: [] })

export function subscribeProfile(uid: string, onValue: (profile: UserProfile | null) => void, onError: (error: Error) => void): Unsubscribe {
  let cancelled = false
  let unsubscribe: Unsubscribe | undefined
  Promise.all([loadFirebase(), import('firebase/firestore')])
    .then(([{ firestore }, { doc, onSnapshot }]) => {
      if (cancelled) return
      unsubscribe = onSnapshot(doc(firestore, 'users', uid), snap => onValue(snap.exists() ? normalizeProfile(uid, snap.data() as Partial<UserProfile>) : null), onError)
    })
    .catch(onError)
  return () => { cancelled = true; unsubscribe?.() }
}

export function subscribeRemoteData(profile: UserProfile, onValue: (data: RemoteData) => void, onError: (error: Error) => void): Unsubscribe {
  let cancelled = false
  let unsubscribeAll: (() => void) | undefined
  Promise.all([loadFirebase(), import('firebase/firestore')])
    .then(([{ firestore: db }, { collection, doc, onSnapshot, query, where }]) => {
      if (cancelled) return
      const state = remoteEmpty(); const unsubscribers: Unsubscribe[] = []
      const publish = () => onValue({ ...state })
      const scope = (path: string, employeeField: string): Query => profile.role === 'area_manager' ? query(collection(db, path)) : query(collection(db, path), where(employeeField, '==', profile.role === 'employee' ? profile.uid : profile.storeId))
      const watch = <T>(source: Query, assign: (items: T[]) => void) => unsubscribers.push(onSnapshot(source, snapshot => { assign(documents<T>(snapshot)); publish() }, onError))
      if (profile.role === 'employee') {
        unsubscribers.push(onSnapshot(doc(db, 'users', profile.uid), snapshot => { state.profiles = snapshot.exists() ? [normalizeProfile(snapshot.id, snapshot.data() as Partial<UserProfile>)] : []; publish() }, onError))
      } else watch<UserProfile>(scope('users', 'storeId'), values => { state.profiles = values.map(item => normalizeProfile(item.uid, item)) })
      watch<DailyEntry>(scope('dailyEntries', profile.role === 'employee' ? 'employeeId' : 'storeId'), values => { state.entries = values })
      watch<MonthlyGoal>(scope('monthlyGoals', profile.role === 'employee' ? 'employeeId' : 'storeId'), values => { state.goals = values })
      watch<ScheduleShift>(scope('scheduleShifts', profile.role === 'employee' ? 'employeeId' : 'storeId'), values => { state.shifts = values })
      watch<ScheduleNotification>(query(collection(db, 'scheduleNotifications'), where('employeeId', '==', profile.uid)), values => { state.notifications = values })
      watch<Store>(query(collection(db, 'stores')), values => { state.stores = values })
      unsubscribeAll = () => unsubscribers.forEach(unsubscribe => unsubscribe())
    })
    .catch(onError)
  return () => { cancelled = true; unsubscribeAll?.() }
}

export async function saveProfile(profile: UserProfile) {
  const { firestore } = await loadFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(firestore, 'users', profile.uid), { ...profile, updatedAt: new Date().toISOString(), createdAt: profile.createdAt || new Date().toISOString() }, { merge: true })
}
export async function saveEntry(entry: DailyEntry) {
  const { firestore } = await loadFirebase()
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore')
  await setDoc(doc(firestore, 'dailyEntries', entry.id), { ...entry, updatedAt: new Date().toISOString(), serverUpdatedAt: serverTimestamp() }, { merge: true })
}
export async function saveGoal(goal: MonthlyGoal) {
  const { firestore } = await loadFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(firestore, 'monthlyGoals', goal.id), goal, { merge: true })
}
export async function saveStore(store: Store) {
  const { firestore } = await loadFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(firestore, 'stores', store.id), store, { merge: true })
}
export async function saveNotification(notification: ScheduleNotification) {
  const { firestore } = await loadFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(firestore, 'scheduleNotifications', notification.id), notification, { merge: true })
}
export async function markNotificationsRead(uid: string) {
  const { firestore } = await loadFirebase()
  const { doc, getDoc } = await import('firebase/firestore')
  const data = await getDoc(doc(firestore, 'users', uid))
  if (!data.exists()) throw new Error('Profile does not exist.')
}
