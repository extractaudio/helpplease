import { initialState, stores as seededStores } from './data'
import type { AppState, Store } from './types'

export function storesForDisplay(available: Store[]) {
  const byId = new Map(available.map(store => [store.id, store]))
  return seededStores.map(store => byId.get(store.id) || store)
}

export function hydrateAppState(value: Partial<AppState>): AppState {
  return { ...initialState, ...value, stores: storesForDisplay(value.stores || []) }
}
