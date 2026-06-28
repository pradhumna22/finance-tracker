import { createClient } from '@/lib/supabase-server'

const INVEST_ICONS: Record<string, string> = {
  'Mutual Fund': '📊', 'Stocks': '📈', 'FD/RD': '🏦', 'Crypto': '₿', 'Other': '💼',
}

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('transactions')
    .select('amount,subcategory,date')
    .eq('user_id', user!.id)
    .eq('type', 'investment')
    .order('date', { ascending: false })

  const byType: Record<string, number> = {}
  for (const r of rows ?? []) {
    const key = r.subcategory ?? 'Other'
    byType[key] = (byType[key] ?? 0) + r.amount
  }

  const total = Object.values(byType).reduce((s, v) => s + v, 0)

  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-1">Investments</h1>
      <p className="text-gray-400 text-sm mb-4">
        Total invested: <span className="text-blue-400 font-semibold">₹{total.toLocaleString('en-IN')}</span>
      </p>

      {Object.keys(byType).length === 0 ? (
        <div className="text-center text-gray-500 py-12">No investments logged yet.<br/>Try: <span className="font-mono text-gray-300">&quot;5000 sip&quot;</span></div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => (
            <div key={type} className="bg-gray-900 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{INVEST_ICONS[type] ?? '💼'}</span>
                <div>
                  <div className="font-medium">{type}</div>
                  <div className="text-xs text-gray-500">{Math.round((amount / total) * 100)}% of portfolio</div>
                </div>
              </div>
              <div className="text-blue-400 font-semibold">₹{amount.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
