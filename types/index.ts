export type TransactionType = 'expense' | 'income' | 'investment'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category: string
  subcategory: string | null
  description: string
  raw_message: string
  date: string // ISO date YYYY-MM-DD
  created_at: string
  source: 'whatsapp' | 'manual'
}

export interface ParsedMessage {
  amount: number
  type: TransactionType
  category: string
  subcategory: string | null
  description: string
  date: string
}

export interface MonthlySummary {
  total_expense: number
  total_income: number
  total_investment: number
  category_breakdown: Record<string, number>
}

export interface CoachInsight {
  category: string
  current_month: number
  avg_3_months: number
  percent_change: number
  alert: 'red' | 'yellow' | 'green'
  tip: string
}
