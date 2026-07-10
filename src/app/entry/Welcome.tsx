import { useState } from 'react'
import { signInWithGoogle } from '@/services/auth'

export function Welcome({ hasLiveSession, liveEnabled, onDemo, onLive, showSignIn = false }: { hasLiveSession: boolean; liveEnabled: boolean; onDemo: () => void; onLive: () => void; showSignIn?: boolean }) {
  const [error, setError] = useState('')
  const secure = async () => {
    if (hasLiveSession) { onLive(); return }
    try {
      await signInWithGoogle()
      onLive()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in securely.')
    }
  }
  return (
    <div className="sign-in">
      <div className="sign-card">
        <span className="brand-mark">PQH</span>
        <p className="eyebrow">MONTANA PERFORMANCE HUB</p>
        <h1>{showSignIn ? 'Secure access.' : 'Welcome.'}</h1>
        <p>{showSignIn ? 'Use your Cricket Google account to open your live workspace.' : 'Choose a secure live workspace or explore the app with sample Montana team data.'}</p>
        <button className="primary wide" onClick={() => void secure()} disabled={!liveEnabled}>
          {hasLiveSession ? 'Open live workspace' : 'Sign in securely with Google'}
        </button>
        {!liveEnabled && <small>Live access has not been configured yet. Demo mode is available now.</small>}
        <button className="secondary wide" onClick={onDemo}>Explore demo</button>
        <small>Demo mode uses sample data on this device only and never changes the live workspace.</small>
        {error && <p className="error-copy">{error}</p>}
      </div>
    </div>
  )
}
