import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { observeAuth } from '@/services/auth'
import { firebaseEnabled } from '@/services/firebase'
import { subscribeProfile, subscribeRemoteData, type RemoteData } from '@/services/repository'
import type { UserProfile } from '@/domain/types'

export function useFirebaseSession() {
  const [user, setUser] = useState<User | null | undefined>(firebaseEnabled ? undefined : null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => firebaseEnabled ? observeAuth(setUser, error => setError(error.message)) : undefined, [])
  return { user, error }
}

export function useRemoteData(user: User | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined)
  const [data, setData] = useState<RemoteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!user) { setProfile(user === undefined ? undefined : null); setData(null); return } return subscribeProfile(user.uid, setProfile, error => setError(error.message)) }, [user])
  useEffect(() => { if (!profile) return; return subscribeRemoteData(profile, setData, error => setError(error.message)) }, [profile])
  return { profile, data, error }
}
