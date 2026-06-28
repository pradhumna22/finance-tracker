import { createClient } from '@/lib/supabase-server'
import CategoryChart from '@/components/CategoryChart'

export default async function SpendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: rows } = await supabase
    .from('transactions')
    .select('amount,category')
    .eq('user_id', user!.id)
    .eq('type', 'expense')
    .gte('date', startDate)

  const byCategory: Record<string, number> = {}
  for (const r of rows ?? []) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + r.amount
  }

  const totalExpense = Object.values(byCategory).reduce((s, v) => s + v, 0)
  const chartData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-1">Spending</h1>
      <p className="text-gray-400 text-sm mb-4">
        Total: <span className="text-red-400 font-semibold">₹{totalExpense.toLocaleString('en-IN')}</span> this month
      </p>

      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <CategoryChart data={chartData} />
      </div>

      <div className="space-y-2">
        {chartData.map(({ name, value }) => {
          const pct = totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0
          return (
            <div key={name} className="bg-gray-900 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-gray-500">{pct}% of spending</div>
              </div>
              <div className="text-red-400 font-semibold">₹{value.toLocaleString('en-IN')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
