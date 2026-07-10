import { describe, expect, it } from 'vitest'
import { hydrateAppState, storesForDisplay } from '@/domain/app-state'
import { stores } from '@/data'

describe('app state hydration', () => {
  it('adds seeded stores to legacy demo state', () => {
    expect(hydrateAppState({ profiles: [] }).stores).toEqual(stores)
  })

  it('preserves edited store data', () => {
    const edited = [{ ...stores[0], phone: '(406) 555-9999' }]
    expect(hydrateAppState({ stores: edited }).stores[0].phone).toBe('(406) 555-9999')
    expect(hydrateAppState({ stores: edited }).stores).toHaveLength(5)
  })

  it('overlays partial live store data onto all five seeded stores', () => {
    const remote = [{ ...stores[1], address: 'Updated address' }]
    expect(storesForDisplay(remote)).toHaveLength(5)
    expect(storesForDisplay(remote).find(store => store.id === 'bozeman')?.address).toBe('Updated address')
  })
})
