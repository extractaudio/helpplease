import type { StoreId, UserProfile } from './types'

export function phoneHref(phone: string, scheme: 'tel' | 'sms') {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const normalized = digits.length === 10 ? `+1${digits}` : `+${digits}`
  return `${scheme}:${normalized}`
}

export const mapHref = (address: string) => address.trim()
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
  : null

export const canEditStore = (user: UserProfile, storeId: StoreId) =>
  user.role === 'area_manager' || (user.role === 'store_manager' && user.storeId === storeId)
