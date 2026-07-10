import type { Metrics } from '@/domain/types'

export const metricLabels = {
  grossAdds: 'New gross adds',
  upgrades: 'Upgrades',
  homeInternet: 'Home Internet',
  watches: 'Watches',
  tablets: 'Tablets',
  accessories: 'Accessories',
  upgradePlus: 'Upgrade Plus',
  ild: 'ILD',
  leases: 'Leases',
  billPayAdds: 'Bill-pay adds',
  milestoneSheets: 'Milestone sheets'
}

export const zeroMetrics = (): Metrics => ({
  grossAdds: 0,
  upgrades: 0,
  homeInternet: 0,
  watches: 0,
  tablets: 0,
  accessories: 0,
  upgradePlus: 0,
  ild: 0,
  leases: 0,
  billPayAdds: 0,
  milestoneSheets: 0
})
