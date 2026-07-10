import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where, type DocumentData, type Firestore, type Query, type Unsubscribe } from 'firebase/firestore'
import { firestore } from './firebase'
import { metricKeys } from './types'
import type { DailyEntry, Metrics, MonthlyGoal, ScheduleNotification, ScheduleShift, Store, StoreId, UserProfile } from './types'

export type RemoteData = { profiles: UserProfile[]; entries: DailyEntry[]; goals: MonthlyGoal[]; shifts: ScheduleShift[]; notifications: ScheduleNotification[]; stores: Store[] }
export const emptyMetrics = (): Metrics => Object.fromEntries(metricKeys.map(key => [key, 0])) as Metrics
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
  if (!firestore) return () => undefined
  return onSnapshot(doc(firestore, 'users', uid), snap => onValue(snap.exists() ? normalizeProfile(uid, snap.data() as Partial<UserProfile>) : null), onError)
}

export function subscribeRemoteData(profile: UserProfile, onValue: (data: RemoteData) => void, onError: (error: Error) => void): Unsubscribe {
  if (!firestore) return () => undefined
  const db = firestore; const state = remoteEmpty(); const unsubscribers: Unsubscribe[] = []
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
  return () => unsubscribers.forEach(unsubscribe => unsubscribe())
}

const dbRequired = (): Firestore => { if (!firestore) throw new Error('Firebase is not configured.'); return firestore }
export async function saveProfile(profile: UserProfile) { await setDoc(doc(dbRequired(), 'users', profile.uid), { ...profile, updatedAt: new Date().toISOString(), createdAt: profile.createdAt || new Date().toISOString() }, { merge: true }) }
export async function saveEntry(entry: DailyEntry) { await setDoc(doc(dbRequired(), 'dailyEntries', entry.id), { ...entry, updatedAt: new Date().toISOString(), serverUpdatedAt: serverTimestamp() }, { merge: true }) }
export async function saveGoal(goal: MonthlyGoal) { await setDoc(doc(dbRequired(), 'monthlyGoals', goal.id), goal, { merge: true }) }
export async function saveStore(store: Store) { await setDoc(doc(dbRequired(), 'stores', store.id), store, { merge: true }) }
export async function saveNotification(notification: ScheduleNotification) { await setDoc(doc(dbRequired(), 'scheduleNotifications', notification.id), notification, { merge: true }) }
export async function markNotificationsRead(uid: string) {
  const data = await getDoc(doc(dbRequired(), 'users', uid)); if (!data.exists()) throw new Error('Profile does not exist.')
}
