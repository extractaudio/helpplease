import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

const provider = new GoogleAuthProvider()
provider.addScope('email')
provider.addScope('profile')

export function signInWithGoogle() {
  if (!auth) return Promise.reject(new Error('Firebase is not configured.'))
  return signInWithPopup(auth, provider).then(() => undefined)
}

export function signOutUser() { return auth ? signOut(auth) : Promise.resolve() }

export function observeAuth(onValue: (user: User | null) => void, onError: (error: Error) => void) {
  return auth ? onAuthStateChanged(auth, onValue, onError) : () => undefined
}
