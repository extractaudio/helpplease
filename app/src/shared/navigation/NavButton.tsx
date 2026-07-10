import type { NavItem, Page } from './nav-items'

export function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: (page: Page) => void }) {
  const Icon = item.icon
  return (
    <button className={active ? 'nav-item active' : 'nav-item'} onClick={() => onClick(item.page)}>
      <Icon size={18}/>
      <span>{item.label}</span>
    </button>
  )
}
