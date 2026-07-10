import type { User } from 'firebase/auth'
import { firebaseEnabled, loadFirebase } from '@/services/firebase'

export async function signInWithGoogle() {
  const { auth } = await loadFirebase()
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  await signInWithPopup(auth, provider)
}

export async function signOutUser() {
  if (!firebaseEnabled) return
  const { auth } = await loadFirebase()
  const { signOut } = await import('firebase/auth')
  await signOut(auth)
}

export function observeAuth(onValue: (user: User | null) => void, onError: (error: Error) => void) {
  if (!firebaseEnabled) return () => undefined
  let cancelled = false
  let unsubscribe: (() => void) | undefined
  Promise.all([loadFirebase(), import('firebase/auth')])
    .then(([{ auth }, { onAuthStateChanged }]) => {
      if (cancelled) return
      unsubscribe = onAuthStateChanged(auth, onValue, onError)
    })
    .catch(onError)
  return () => { cancelled = true; unsubscribe?.() }
}
