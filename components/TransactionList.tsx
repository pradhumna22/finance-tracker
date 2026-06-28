import type { Transaction } from '@/types'

const TYPE_STYLE: Record<string, string> = {
  expense: 'text-red-400',
  income: 'text-green-400',
  investment: 'text-blue-400',
}
const TYPE_SIGN: Record<string, string> = { expense: '-', income: '+', investment: '↑' }

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <div className="text-center text-gray-500 py-12">No transactions yet.<br/>Send a WhatsApp message to log one.</div>
  }

  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.id} className="bg-gray-900 rounded-xl p-4 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{tx.description}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {tx.category}{tx.subcategory ? ` › ${tx.subcategory}` : ''} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div className={`font-semibold ml-3 ${TYPE_STYLE[tx.type]}`}>
            {TYPE_SIGN[tx.type]}₹{tx.amount.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  )
}
