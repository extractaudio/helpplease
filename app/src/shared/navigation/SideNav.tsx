import { CalendarDays, Users } from 'lucide-react'
import { nav, type Page } from './nav-items'
import { NavButton } from './NavButton'

export function SideNav({ page, onClick, isManager }: { page: Page; onClick: (page: Page) => void; isManager: boolean }) {
  return (
    <>
      <p className="eyebrow">WORKSPACE</p>
      {nav.map(item => <NavButton key={item.page} item={item} active={page === item.page} onClick={onClick}/>)}
      <button className={page === 'schedule' ? 'nav-item active' : 'nav-item'} onClick={() => onClick('schedule')}>
        <CalendarDays size={18}/><span>My Schedule</span>
      </button>
      <button className={page === 'storeSchedule' ? 'nav-item active' : 'nav-item'} onClick={() => onClick('storeSchedule')}>
        <Users size={18}/><span>Store Schedule</span>
      </button>
      {isManager && (
        <>
          <p className="eyebrow section-label">ADMINISTRATION</p>
          <button className={page === 'employees' ? 'nav-item active' : 'nav-item'} onClick={() => onClick('employees')}>
            <Users size={18}/><span>Employees</span>
          </button>
        </>
      )}
    </>
  )
}
