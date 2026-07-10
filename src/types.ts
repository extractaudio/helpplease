export const metricKeys = ['grossAdds','upgrades','homeInternet','watches','tablets','accessories','upgradePlus','ild','leases','billPayAdds','milestoneSheets'] as const
export type MetricKey = typeof metricKeys[number]
export type Metrics = Record<MetricKey, number>
export type Role = 'employee' | 'store_manager' | 'area_manager'
export type Status = 'pending' | 'active' | 'inactive'
export type StoreId = 'helena' | 'bozeman' | 'billings-main' | 'billings-west' | 'missoula'
export interface Store { id: StoreId; name: string; phone: string; address: string }
export interface UserProfile { uid: string; fullName: string; workEmail: string; personalGoogleEmail: string; cellPhone: string; jobTitle: string; storeId: StoreId; role: Role; status: Status; createdAt?: string; updatedAt?: string }
export interface DailyEntry { id: string; employeeId: string; storeId: StoreId; businessDate: string; metrics: Metrics; notes: string; updatedBy: string; updatedAt: string }
export interface MonthlyGoal { id: string; employeeId: string; storeId: StoreId; monthKey: string; targets: Metrics }
export interface MilestoneRule { id: string; label: string; metric: MetricKey; threshold: number; fixedPayoutCents?: number; commissionBand?: string; active: boolean }
export interface AppState { profiles: UserProfile[]; entries: DailyEntry[]; goals: MonthlyGoal[]; rules: MilestoneRule[]; shifts: ScheduleShift[]; notifications: ScheduleNotification[]; currentUserId: string; trustedDevice: boolean }

export interface ScheduleShift { id: string; employeeId: string; employeeName: string; storeId: StoreId; businessDate: string; startTime: string; endTime: string; jobTitle: string; notes: string; sourceHash: string; syncedAt: string }
export interface ScheduleNotification { id: string; employeeId: string; type: 'added' | 'changed' | 'removed'; shiftId: string; message: string; read: boolean; createdAt: string }
export interface ScheduleRow { 'Shift ID': string; 'Employee Name': string; 'Work Email': string; Store: string; Date: string; 'Start Time': string; 'End Time': string; 'Job Title': string; Notes: string }
