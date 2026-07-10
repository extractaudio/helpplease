import type { AppState, Metrics, Store } from './types'

export const stores: Store[] = [
  { id: 'helena', name: 'Helena', phone: '(406) 555-0130', address: '2750 North Montana Ave, Helena, MT' },
  { id: 'bozeman', name: 'Bozeman', phone: '(406) 555-0131', address: '1900 West Main St, Bozeman, MT' },
  { id: 'billings-main', name: 'Billings Main', phone: '(406) 555-0132', address: '1310 Main St, Billings, MT' },
  { id: 'billings-west', name: 'Billings West', phone: '(406) 555-0133', address: '2875 King Ave W, Billings, MT' },
  { id: 'missoula', name: 'Missoula', phone: '(406) 555-0134', address: '2850 Brooks St, Missoula, MT' }
]

export const metricLabels = {
  grossAdds: 'New gross adds', upgrades: 'Upgrades', homeInternet: 'Home Internet', watches: 'Watches', tablets: 'Tablets', accessories: 'Accessories', upgradePlus: 'Upgrade Plus', ild: 'ILD', leases: 'Leases', billPayAdds: 'Bill-pay adds', milestoneSheets: 'Milestone sheets'
}

export const zeroMetrics = (): Metrics => ({ grossAdds: 0, upgrades: 0, homeInternet: 0, watches: 0, tablets: 0, accessories: 0, upgradePlus: 0, ild: 0, leases: 0, billPayAdds: 0, milestoneSheets: 0 })

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date())
const monthKey = today.slice(0, 7)
const seed = (grossAdds: number, upgrades: number, homeInternet: number, accessories: number) => ({ ...zeroMetrics(), grossAdds, upgrades, homeInternet, accessories, watches: 1, leases: 1, upgradePlus: 1, milestoneSheets: 1 })

export const initialState: AppState = {
  currentUserId: 'morgan', trustedDevice: false,
  profiles: [
    { uid: 'morgan', fullName: 'Morgan Fields', workEmail: 'morgan.fields@example.com', personalGoogleEmail: 'morgan.fields@example.com', cellPhone: '(406) 555-0101', jobTitle: 'Area Manager', storeId: 'helena', role: 'area_manager', status: 'active' },
    { uid: 'alex', fullName: 'Alex Rivera', workEmail: 'alex.rivera@example.com', personalGoogleEmail: 'alex.rivera@example.com', cellPhone: '(406) 555-0102', jobTitle: 'Store Manager', storeId: 'bozeman', role: 'store_manager', status: 'active' },
    { uid: 'jamie', fullName: 'Jamie Lee', workEmail: 'jamie.lee@example.com', personalGoogleEmail: 'jamie.lee@example.com', cellPhone: '(406) 555-0103', jobTitle: 'Wireless Consultant', storeId: 'helena', role: 'employee', status: 'active' },
    { uid: 'taylor', fullName: 'Taylor Brooks', workEmail: 'taylor.brooks@example.com', personalGoogleEmail: 'taylor.brooks@example.com', cellPhone: '(406) 555-0104', jobTitle: 'Wireless Consultant', storeId: 'missoula', role: 'employee', status: 'pending' }
  ],
  entries: [
    { id: `jamie_${today}`, employeeId: 'jamie', storeId: 'helena', businessDate: today, metrics: seed(3, 4, 1, 7), notes: 'Strong morning traffic.', updatedBy: 'jamie', updatedAt: new Date().toISOString() },
    { id: `alex_${today}`, employeeId: 'alex', storeId: 'bozeman', businessDate: today, metrics: seed(2, 3, 2, 5), notes: '', updatedBy: 'alex', updatedAt: new Date().toISOString() }
  ],
  goals: [
    { id: `jamie_${monthKey}`, employeeId: 'jamie', storeId: 'helena', monthKey, targets: { ...zeroMetrics(), grossAdds: 30, upgrades: 42, homeInternet: 8, watches: 8, tablets: 6, accessories: 60, upgradePlus: 15, ild: 12, leases: 12, billPayAdds: 10, milestoneSheets: 20 } },
    { id: `alex_${monthKey}`, employeeId: 'alex', storeId: 'bozeman', monthKey, targets: { ...zeroMetrics(), grossAdds: 35, upgrades: 45, homeInternet: 10, watches: 9, tablets: 7, accessories: 70, upgradePlus: 18, ild: 14, leases: 14, billPayAdds: 12, milestoneSheets: 22 } }
  ],
  shifts: [
    { id: 'shift-1001', employeeId: 'jamie', employeeName: 'Jamie Lee', storeId: 'helena', businessDate: today, startTime: '10:00', endTime: '18:00', jobTitle: 'Wireless Consultant', notes: 'Open shift', sourceHash: 'seed-1', syncedAt: new Date().toISOString() },
    { id: 'shift-1002', employeeId: 'alex', employeeName: 'Alex Rivera', storeId: 'bozeman', businessDate: today, startTime: '10:00', endTime: '19:00', jobTitle: 'Store Manager', notes: '', sourceHash: 'seed-2', syncedAt: new Date().toISOString() }
  ],
  notifications: [
    { id: 'notice-1', employeeId: 'jamie', type: 'changed', shiftId: 'shift-1001', message: 'Your schedule has changed.', read: false, createdAt: new Date().toISOString() }
  ],
  rules: [
    { id: 'lease', label: 'Complete one lease today', metric: 'leases', threshold: 1, fixedPayoutCents: 500, active: true },
    { id: 'billpay', label: 'Add a line on Bill Pay', metric: 'billPayAdds', threshold: 1, fixedPayoutCents: 500, active: true },
    { id: 'internet', label: 'One Home Internet today', metric: 'homeInternet', threshold: 1, fixedPayoutCents: 2000, active: true },
    { id: 'watch', label: 'One watch sold', metric: 'watches', threshold: 1, fixedPayoutCents: 500, active: true },
    { id: 'tablet', label: 'One tablet sold', metric: 'tablets', threshold: 1, fixedPayoutCents: 1000, active: true },
    { id: 'accessories', label: 'Accessories sold', metric: 'accessories', threshold: 1, commissionBand: '10–22% commission band', active: true },
    { id: 'plus', label: 'Upgrade Plus', metric: 'upgradePlus', threshold: 1, fixedPayoutCents: 500, active: true },
    { id: 'ild', label: 'ILD', metric: 'ild', threshold: 1, fixedPayoutCents: 500, active: true },
    { id: 'sheet', label: 'Completed milestone sheet', metric: 'milestoneSheets', threshold: 1, fixedPayoutCents: 2000, active: true }
  ]
}
