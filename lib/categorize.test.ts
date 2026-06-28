import { describe, it, expect } from 'vitest'
import { categorize } from './categorize'

describe('categorize', () => {
  it('categorizes zomato as food outside', () => {
    const r = categorize('500 zomato')
    expect(r.category).toBe('Food')
    expect(r.subcategory).toBe('Outside')
    expect(r.type).toBe('expense')
  })

  it('categorizes protein as health supplements', () => {
    const r = categorize('2500 protein')
    expect(r.category).toBe('Health')
    expect(r.subcategory).toBe('Supplements')
    expect(r.type).toBe('expense')
  })

  it('categorizes salary as income', () => {
    const r = categorize('50000 salary')
    expect(r.category).toBe('Income')
    expect(r.subcategory).toBe('Salary')
    expect(r.type).toBe('income')
  })

  it('categorizes sip as investment', () => {
    const r = categorize('5000 sip')
    expect(r.category).toBe('Investment')
    expect(r.subcategory).toBe('Mutual Fund')
    expect(r.type).toBe('investment')
  })

  it('extracts amount from message', () => {
    const r = categorize('800 movie outing')
    expect(r.amount).toBe(800)
  })

  it('returns unknown category when no match', () => {
    const r = categorize('999 randomxyz')
    expect(r.category).toBe('Other')
    expect(r.type).toBe('expense')
  })
})
