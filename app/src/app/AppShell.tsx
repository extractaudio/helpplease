import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { NavButton, nav, SideNav, type Page } from '@/shared/navigation'
import type { UserProfile } from '@/domain/types'

const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2)

export function AppShell({ user, page, isManager, onSelectPage, children }: {
  user: UserProfile
  page: Page
  isManager: boolean
  onSelectPage: (page: Page) => void
  children: ReactNode
}) {
  const [drawer, setDrawer] = useState(false)
  const selectPage = (next: Page) => { onSelectPage(next); setDrawer(false) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => selectPage('home')} aria-label="Go home">
          <span className="brand-mark">PQH</span>
          <span>Montana <b>Team</b></span>
        </button>
        <nav className="desktop-nav">
          {nav.slice(0, 3).map(item => <NavButton key={item.page} item={item} active={page === item.page} onClick={selectPage}/>)}
        </nav>
        <div className="profile-menu">
          <span className="avatar">{initials(user.fullName)}</span>
          <button onClick={() => selectPage('profile')}>
            <b>{user.fullName}</b>
            <small>{user.status === 'active' ? user.jobTitle : 'Awaiting approval'}</small>
          </button>
        </div>
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu/></button>
      </header>
      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
          <aside className="drawer" onClick={event => event.stopPropagation()}>
            <button className="icon-button close" onClick={() => setDrawer(false)}><X/></button>
            <SideNav page={page} onClick={selectPage} isManager={isManager}/>
          </aside>
        </div>
      )}
      <aside className="sidebar"><SideNav page={page} onClick={selectPage} isManager={isManager}/></aside>
      <main>{children}</main>
      <nav className="bottom-nav">
        {nav.slice(0, 5).map(item => <NavButton key={item.page} item={item} active={page === item.page} onClick={selectPage}/>)}
      </nav>
    </div>
  )
}
