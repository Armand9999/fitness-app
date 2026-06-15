import { z } from 'zod'

export const DateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD.').refine((value) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}, 'Date must be a valid calendar date.')

const pad = (value: number) => String(value).padStart(2, '0')

export function formatLocalDate(date: Date) {
  if (Number.isNaN(date.getTime())) throw new Error('Date must be valid')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getLocalDateKey() {
  return formatLocalDate(new Date())
}

export function parseDateKey(value: string) {
  return DateKeySchema.parse(value)
}

export function getLocalWeekRange(reference = new Date()) {
  const weekStart = new Date(reference)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return {
    weekStart,
    weekEnd,
    startDateKey: formatLocalDate(weekStart),
    endDateKey: formatLocalDate(weekEnd),
  }
}
