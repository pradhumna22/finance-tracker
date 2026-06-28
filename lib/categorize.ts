import type { ParsedMessage, TransactionType } from '@/types'

interface Rule {
  keywords: string[]
  category: string
  subcategory: string | null
  type: TransactionType
}

const RULES: Rule[] = [
  { keywords: ['salary', 'ctc', 'paycheck', 'stipend'], category: 'Income', subcategory: 'Salary', type: 'income' },
  { keywords: ['freelance', 'client payment', 'project payment', 'received', 'got paid'], category: 'Income', subcategory: 'Freelance', type: 'income' },
  { keywords: ['sip', 'mutual fund', 'mf'], category: 'Investment', subcategory: 'Mutual Fund', type: 'investment' },
  { keywords: ['stocks', 'shares', 'zerodha', 'groww', 'equity', 'nifty', 'sensex'], category: 'Investment', subcategory: 'Stocks', type: 'investment' },
  { keywords: ['fd', 'fixed deposit', 'rd', 'recurring deposit'], category: 'Investment', subcategory: 'FD/RD', type: 'investment' },
  { keywords: ['crypto', 'bitcoin', 'btc', 'eth', 'usdt', 'usdc'], category: 'Investment', subcategory: 'Crypto', type: 'investment' },
  { keywords: ['zomato', 'swiggy', 'pizza', 'burger', 'restaurant', 'cafe', 'dining', 'eating out', 'biryani', 'dine'], category: 'Food', subcategory: 'Outside', type: 'expense' },
  { keywords: ['dmart', 'bigbasket', 'grofers', 'blinkit', 'zepto', 'grocery', 'groceries', 'sabzi', 'vegetables', 'fruits'], category: 'Food', subcategory: 'Groceries', type: 'expense' },
  { keywords: ['protein', 'whey', 'creatine', 'multivitamin', 'supplement', 'preworkout', 'bcaa'], category: 'Health', subcategory: 'Supplements', type: 'expense' },
  { keywords: ['gym', 'yoga', 'crossfit', 'fitness', 'membership', 'cult.fit', 'cultfit'], category: 'Health', subcategory: 'Fitness', type: 'expense' },
  { keywords: ['medicine', 'doctor', 'pharmacy', 'hospital', 'chemist', 'medical', 'apollo', 'netmeds'], category: 'Health', subcategory: 'Medical', type: 'expense' },
  { keywords: ['electricity', 'water', 'internet', 'wifi', 'broadband', 'gas', 'maintenance', 'rent', 'mobile recharge', 'recharge'], category: 'Utilities', subcategory: null, type: 'expense' },
  { keywords: ['uber', 'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'metro', 'bus', 'auto', 'cab', 'train', 'flight', 'irctc'], category: 'Transport', subcategory: null, type: 'expense' },
  { keywords: ['clothes', 'shirt', 'shoes', 'jeans', 'fashion', 'myntra', 'ajio', 'h&m', 'zara', 'dress', 'kurta'], category: 'Shopping', subcategory: 'Clothes', type: 'expense' },
  { keywords: ['phone', 'laptop', 'headphones', 'gadget', 'amazon', 'flipkart', 'electronics', 'earphones'], category: 'Shopping', subcategory: 'Electronics', type: 'expense' },
  { keywords: ['movie', 'netflix', 'spotify', 'prime', 'hotstar', 'concert', 'outing', 'bookmyshow', 'ott', 'disney'], category: 'Entertainment', subcategory: null, type: 'expense' },
  { keywords: ['eggs', 'milk', 'paneer', 'atta', 'rice', 'dal', 'masala', 'oil', 'butter', 'bread'], category: 'Food', subcategory: 'Home Cooking', type: 'expense' },
]

function extractAmount(text: string): number {
  const match = text.match(/\d+(\.\d{1,2})?/)
  return match ? parseFloat(match[0]) : 0
}

export function categorize(message: string): ParsedMessage & { amount: number } {
  const lower = message.toLowerCase()
  const amount = extractAmount(message)
  const today = new Date().toISOString().split('T')[0]

  for (const rule of RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return {
        amount,
        type: rule.type,
        category: rule.category,
        subcategory: rule.subcategory,
        description: message.trim(),
        date: today,
      }
    }
  }

  return {
    amount,
    type: 'expense',
    category: 'Other',
    subcategory: null,
    description: message.trim(),
    date: today,
  }
}
