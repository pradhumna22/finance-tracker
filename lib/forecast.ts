// Projects end-of-period total given current spend, days elapsed, total days
export function linearForecast(currentSpend: number, daysElapsed: number, totalDays: number): number {
  if (daysElapsed === 0) return 0
  const dailyRate = currentSpend / daysElapsed
  return dailyRate * totalDays
}

// Returns percent change, positive = increase
export function percentChange(current: number, baseline: number): number {
  if (baseline === 0) return 0
  return ((current - baseline) / baseline) * 100
}
