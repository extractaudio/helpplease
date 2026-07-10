import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)

export type FirebaseServices = { auth: Auth; firestore: Firestore }

let servicesPromise: Promise<FirebaseServices> | undefined

// The Firebase SDK (~800KB) is only fetched once a caller actually needs it, so demo-only or
// unconfigured deployments never download it. Callers share one in-flight/initialized instance.
export function loadFirebase(): Promise<FirebaseServices> {
  if (!firebaseEnabled) return Promise.reject(new Error('Firebase is not configured.'))
  if (!servicesPromise) {
    servicesPromise = Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
      .then(([{ getApp, getApps, initializeApp }, { getAuth }, { initializeFirestore, persistentLocalCache, persistentMultipleTabManager }]) => {
        const app = getApps().length ? getApp() : initializeApp(config)
        const auth = getAuth(app)
        // Persistent cache is initialized only after the profile's trusted-device consent in production wiring.
        const firestore = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
        return { auth, firestore }
      })
  }
  return servicesPromise
}
