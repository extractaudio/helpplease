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
  // subscribeRemoteData's queries only depend on uid/role/storeId, but `profile` gets a new
  // object reference on every snapshot (e.g. a ProfilePage save). Keying off a scope string
  // instead of the object reference avoids tearing down and re-subscribing every collection
  // for unrelated field edits (name, phone, ...). `profile` is still read fresh from this
  // render's closure, so this can't observe a stale value.
  const scopeKey = profile ? `${profile.uid}:${profile.role}:${profile.storeId}` : null
  useEffect(() => {
    if (!profile) { setData(null); return }
    return subscribeRemoteData(profile, setData, error => setError(error.message))
  }, [scopeKey])
  return { profile, data, error }
}
