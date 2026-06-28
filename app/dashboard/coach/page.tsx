import { createClient } from '@/lib/supabase-server'
import { computeHealthScore, alertLevel } from '@/lib/coach'
import { percentChange, linearForecast } from '@/lib/forecast'
import CoachPanel from '@/components/CoachPanel'
import type { CoachInsight } from '@/types'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const daysElapsed = now.getDate()
  const daysInMonth = new Date(thisYear, thisMonth, 0).getDate()
  const startOfMonth = `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`

  const { data: currentRows } = await supabase
    .from('transactions')
    .select('amount,type,category')
    .eq('user_id', user!.id)
    .gte('date', startOfMonth)

  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: histRows } = await supabase
    .from('transactions')
    .select('amount,type,category')
    .eq('user_id', user!.id)
    .lt('date', startOfMonth)
    .gte('date', threeMonthsAgo.toISOString().split('T')[0])

  const currentByCategory: Record<string, number> = {}
  let income = 0, expense = 0, investment = 0
  for (const r of currentRows ?? []) {
    if (r.type === 'expense') {
      currentByCategory[r.category] = (currentByCategory[r.category] ?? 0) + r.amount
      expense += r.amount
    }
    if (r.type === 'income') income += r.amount
    if (r.type === 'investment') investment += r.amount
  }

  const histByCategory: Record<string, number> = {}
  for (const r of histRows ?? []) {
    if (r.type === 'expense') {
      histByCategory[r.category] = (histByCategory[r.category] ?? 0) + r.amount
    }
  }

  const score = computeHealthScore({ income, expense, investment })

  const insights: CoachInsight[] = Object.entries(currentByCategory).map(([cat, current]) => {
    const histTotal = histByCategory[cat] ?? 0
    const avg3 = histTotal / 3
    const pct = percentChange(current, avg3)
    const level = alertLevel(pct)
    const projected = linearForecast(current, daysElapsed, daysInMonth)
    const tip = avg3 === 0
      ? `First time tracking ${cat} — set a budget target for next month.`
      : level === 'red'
        ? `You're ${Math.round(pct)}% over your average on ${cat}. Projected: ₹${Math.round(projected).toLocaleString('en-IN')} by month end.`
        : level === 'yellow'
          ? `Slightly elevated ${cat} spending. Keep an eye on it.`
          : `${cat} spending is on track. Great job!`

    return { category: cat, current_month: current, avg_3_months: Math.round(avg3), percent_change: pct, alert: level, tip }
  }).sort((a, b) => b.percent_change - a.percent_change)

  const projectedExpense = linearForecast(expense, daysElapsed, daysInMonth)

  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-1">Savings Coach</h1>
      <p className="text-gray-400 text-sm mb-4">Health score: <span className="text-indigo-400 font-bold">{score}/100</span></p>

      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">End-of-Month Forecast</div>
        <div className="text-2xl font-bold text-red-400">₹{Math.round(projectedExpense).toLocaleString('en-IN')}</div>
        <div className="text-xs text-gray-400 mt-1">projected total expenses ({daysElapsed}/{daysInMonth} days in)</div>
      </div>

      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Category Alerts</div>
      <CoachPanel insights={insights} />
    </div>
  )
}
