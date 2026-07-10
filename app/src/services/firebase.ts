import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)
export const firebaseApp = firebaseEnabled ? (getApps().length ? getApp() : initializeApp(config)) : undefined
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined
// Persistent cache is initialized only after the profile's trusted-device consent in production wiring.
export const db = firebaseApp ? initializeFirestore(firebaseApp, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }) : undefined
export const firestore = db || (firebaseApp ? getFirestore(firebaseApp) : undefined)
