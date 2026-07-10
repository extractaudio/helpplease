import { describe, expect, it } from 'vitest'
import { firebaseEnabled, loadFirebase } from '@/services/firebase'

describe('firebase lazy loading', () => {
  it('reports disabled when no Firebase config is present', () => {
    expect(firebaseEnabled).toBe(false)
  })

  it('rejects without importing the SDK when Firebase is not configured', async () => {
    await expect(loadFirebase()).rejects.toThrow('Firebase is not configured.')
  })
})
