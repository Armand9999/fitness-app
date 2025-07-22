export function getWeekDates() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  // Set to the first day of the week (Sunday)
  weekStart.setDate(now.getDate() - now.getDay())

  const weekEnd = new Date(weekStart)
  // Set to the last day of the week (Saturday)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}
