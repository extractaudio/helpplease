import type { Store } from '@/domain/types'

export const stores: Store[] = [
  { id: 'helena', name: 'Helena', phone: '(406) 555-0130', address: '2750 North Montana Ave, Helena, MT' },
  { id: 'bozeman', name: 'Bozeman', phone: '(406) 555-0131', address: '1900 West Main St, Bozeman, MT' },
  { id: 'billings-main', name: 'Billings Main', phone: '(406) 555-0132', address: '1310 Main St, Billings, MT' },
  { id: 'billings-west', name: 'Billings West', phone: '(406) 555-0133', address: '2875 King Ave W, Billings, MT' },
  { id: 'missoula', name: 'Missoula', phone: '(406) 555-0134', address: '2850 Brooks St, Missoula, MT' }
]

export const storeName = (id: string) => stores.find(store => store.id === id)?.name || id
