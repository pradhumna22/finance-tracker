import { percentChange } from './forecast'

interface HealthInputs {
  income: number
  expense: number
  investment: number
}

export function computeHealthScore({ income, expense, investment }: HealthInputs): number {
  if (income === 0) return 0

  const savingsRate = Math.max(0, (income - expense) / income)
  const savingsScore = Math.min(40, savingsRate * 133)

  const investmentRate = Math.min(investment / income, 0.3)
  const investmentScore = (investmentRate / 0.3) * 30

  const spendRatio = Math.max(0, 1 - expense / income)
  const spendScore = spendRatio * 30

  return Math.round(savingsScore + investmentScore + spendScore)
}

export function generateNudge(category: string, currentMonthSpend: number, avgSpend: number): string | null {
  const change = percentChange(currentMonthSpend, avgSpend)
  if (change < 20) return null

  const overBy = Math.round(change)
  const extra = Math.round(currentMonthSpend - avgSpend)
  return `You've spent ₹${currentMonthSpend.toLocaleString('en-IN')} on ${category} this month — ${overBy}% above your average (₹${extra.toLocaleString('en-IN')} extra)`
}

export function alertLevel(percentOver: number): 'red' | 'yellow' | 'green' {
  if (percentOver >= 30) return 'red'
  if (percentOver >= 15) return 'yellow'
  return 'green'
}
