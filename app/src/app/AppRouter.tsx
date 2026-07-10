import { Dashboard, DailyPage, GoalsPage, HomePage, Leaderboard, MilestonesPage } from '@/features/performance'
import { MySchedulePage, StoreOpenPage, StoreSchedulePage } from '@/features/schedule'
import { EmployeesPage, ProfilePage } from '@/features/administration'
import { StoreDirectoryPage } from '@/features/stores'
import type { Page } from '@/shared/navigation'
import type { AppState, DailyEntry, Metrics, MonthlyGoal, StoreId, UserProfile } from '@/domain/types'

type Props = {
  page: Page
  state: AppState
  user: UserProfile
  isManager: boolean
  isArea: boolean
  actuals: Metrics
  goal?: MonthlyGoal
  scheduleStoreId?: StoreId
  selectPage: (page: Page) => void
  onScheduleStore: (storeId: StoreId) => void
  update: (change: (state: AppState) => AppState) => void
  onSignOut: () => void
}

export function AppRouter({ page, state, user, isManager, isArea, actuals, goal, scheduleStoreId, selectPage, onScheduleStore, update, onSignOut }: Props) {
  const saveEntry = (entry: DailyEntry) =>
    update(current => ({ ...current, entries: [...current.entries.filter(item => item.id !== entry.id), entry] }))

  switch (page) {
    case 'home':
      return <HomePage user={user} actuals={actuals} goal={goal?.targets} setPage={selectPage} isManager={isManager}/>
    case 'daily':
      return <DailyPage user={user} entries={state.entries} onSave={saveEntry}/>
    case 'dashboard':
      return <Dashboard state={state} user={user} isManager={isManager}/>
    case 'goals':
      return <GoalsPage state={state} user={user} onChange={update} isManager={isManager}/>
    case 'milestones':
      return <MilestonesPage state={state} user={user} onSave={saveEntry}/>
    case 'leaderboard':
      return <Leaderboard state={state}/>
    case 'schedule':
      return <MySchedulePage state={state} user={user} onChange={update}/>
    case 'storeSchedule':
      return <StoreSchedulePage state={state} user={user} initialStoreId={scheduleStoreId}/>
    case 'open':
      return <StoreOpenPage shifts={state.shifts}/>
    case 'directory':
      return <StoreDirectoryPage state={state} user={user} onChange={update} onSchedule={onScheduleStore}/>
    case 'employees':
      return <EmployeesPage state={state} user={user} onChange={update} isArea={isArea}/>
    case 'profile':
      return (
        <ProfilePage
          user={user}
          trusted={state.trustedDevice}
          onChange={(profile, trusted) => update(current => ({ ...current, trustedDevice: trusted, profiles: current.profiles.map(item => item.uid === profile.uid ? profile : item) }))}
          onSignOut={onSignOut}
        />
      )
    default:
      return null
  }
}
