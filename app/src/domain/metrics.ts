import { metricKeys } from '@/domain/types'
import type { DailyEntry, MonthlyGoal, Metrics, MilestoneRule } from '@/domain/types'

export const currentBusinessDate = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date())

export const currentMonth = () => currentBusinessDate().slice(0, 7)

export const addMetrics = (items: Metrics[]): Metrics =>
  metricKeys.reduce(
    (result, key) => ({ ...result, [key]: items.reduce((sum, item) => sum + item[key], 0) }),
    {} as Metrics
  )

export const monthlyActualsFor = (entries: DailyEntry[], employeeId: string, month: string) =>
  addMetrics(entries.filter(entry => entry.employeeId === employeeId && entry.businessDate.startsWith(month)).map(entry => entry.metrics))

export const monthlyGoalFor = (goals: MonthlyGoal[], employeeId: string, month: string) =>
  goals.find(goal => goal.employeeId === employeeId && goal.monthKey === month)

export const pacePercent = (date = new Date()) => {
  const denverParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(date)
    .reduce<Record<string, string>>((value, part) => ({ ...value, [part.type]: part.value }), {})
  const day = Number(denverParts.day)
  const days = new Date(Number(denverParts.year), Number(denverParts.month), 0).getDate()
  return day / days
}

export const statusFor = (actual: number, target: number, pace = pacePercent()) => {
  if (target === 0) return 'neutral' as const
  const progress = actual / target
  return progress >= pace ? 'green' as const : progress >= pace * .8 ? 'yellow' as const : 'red' as const
}

export const dollars = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export const payoutFor = (metrics: Metrics, rules: MilestoneRule[]) =>
  rules.reduce((total, rule) => total + (metrics[rule.metric] >= rule.threshold ? rule.fixedPayoutCents ?? 0 : 0), 0)
