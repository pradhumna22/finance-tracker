import { createClient } from '@/lib/supabase-server'
import { computeHealthScore } from '@/lib/coach'
import HealthScore from '@/components/HealthScore'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: rows } = await supabase
    .from('transactions')
    .select('amount,type,category')
    .eq('user_id', user!.id)
    .gte('date', startDate)

  const income = (rows ?? []).filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = (rows ?? []).filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const investment = (rows ?? []).filter(r => r.type === 'investment').reduce((s, r) => s + r.amount, 0)
  const saved = income - expense - investment
  const score = computeHealthScore({ income, expense, investment })

  const month = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">{month}</p>

      <div className="bg-gray-900 rounded-2xl p-6 mb-4 text-center">
        <HealthScore score={score} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Income" value={income} color="text-green-400" icon="💰" />
        <StatCard label="Spent" value={expense} color="text-red-400" icon="💸" />
        <StatCard label="Invested" value={investment} color="text-blue-400" icon="📈" />
        <StatCard label="Saved" value={saved} color={saved >= 0 ? 'text-green-400' : 'text-red-400'} icon="🏦" />
      </div>

      <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-400 text-center">
        Send a WhatsApp message to log expenses<br/>
        <span className="text-gray-300 font-mono text-xs">e.g. &quot;2500 protein&quot; or &quot;500 zomato&quot;</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="text-lg mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>₹{value.toLocaleString('en-IN')}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
