import { BarChart3, CheckCircle2, ClipboardList, Home, MapPin, Store, Target, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'

export type Page =
  | 'home'
  | 'daily'
  | 'dashboard'
  | 'goals'
  | 'milestones'
  | 'leaderboard'
  | 'schedule'
  | 'storeSchedule'
  | 'open'
  | 'directory'
  | 'employees'
  | 'profile'

export type NavItem = { page: Page; label: string; icon: ComponentType<{ size?: number }> }

export const nav: NavItem[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'daily', label: 'Daily numbers', icon: ClipboardList },
  { page: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { page: 'goals', label: 'Goals', icon: Target },
  { page: 'milestones', label: 'Milestones', icon: CheckCircle2 },
  { page: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { page: 'open', label: 'Store status', icon: MapPin },
  { page: 'directory', label: 'Store Directory', icon: Store }
]
