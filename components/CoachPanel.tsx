import type { CoachInsight } from '@/types'

const ALERT_STYLE = {
  red: 'border-red-700 bg-red-900/20',
  yellow: 'border-yellow-700 bg-yellow-900/20',
  green: 'border-green-700 bg-green-900/20',
}
const ALERT_DOT = { red: 'bg-red-400', yellow: 'bg-yellow-400', green: 'bg-green-400' }

export default function CoachPanel({ insights }: { insights: CoachInsight[] }) {
  if (insights.length === 0) {
    return <div className="text-center text-gray-500 py-8">Not enough data yet for coaching.<br/>Log at least 1 month of expenses.</div>
  }

  return (
    <div className="space-y-3">
      {insights.map(ins => (
        <div key={ins.category} className={`rounded-xl p-4 border ${ALERT_STYLE[ins.alert]}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ALERT_DOT[ins.alert]}`} />
              <span className="font-semibold">{ins.category}</span>
            </div>
            <span className={`text-sm font-medium ${ins.percent_change > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {ins.percent_change > 0 ? '+' : ''}{Math.round(ins.percent_change)}%
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-2">
            This month: ₹{ins.current_month.toLocaleString('en-IN')} · 3-month avg: ₹{ins.avg_3_months.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-300">{ins.tip}</div>
        </div>
      ))}
    </div>
  )
}
