import { createClient } from '@/lib/supabase-server'
import TransactionList from '@/components/TransactionList'
import type { Transaction } from '@/types'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-4">Transaction History</h1>
      <TransactionList transactions={(rows ?? []) as Transaction[]} />
    </div>
  )
}
