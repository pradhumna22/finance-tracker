import { describe, it, expect } from 'vitest'
import { computeHealthScore, generateNudge } from './coach'
import { linearForecast } from './forecast'

describe('computeHealthScore', () => {
  it('returns high score for good finances', () => {
    const score = computeHealthScore({ income: 100000, expense: 40000, investment: 20000 })
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('returns low score when expenses exceed income', () => {
    const score = computeHealthScore({ income: 50000, expense: 55000, investment: 0 })
    expect(score).toBeLessThan(40)
  })

  it('returns 0 when income is 0', () => {
    expect(computeHealthScore({ income: 0, expense: 0, investment: 0 })).toBe(0)
  })
})

describe('generateNudge', () => {
  it('returns null when spending is below 20% over average', () => {
    const nudge = generateNudge('Food', 8000, 12000)
    expect(nudge).toBeNull()
  })

  it('returns nudge string when 20%+ over average', () => {
    const nudge = generateNudge('Food', 15000, 12000)
    expect(nudge).not.toBeNull()
    expect(nudge).toContain('Food')
  })
})

describe('linearForecast', () => {
  it('extrapolates end-of-month spend from daily amounts', () => {
    const projected = linearForecast(10000, 10, 30)
    expect(projected).toBeCloseTo(30000)
  })

  it('returns 0 when no days elapsed', () => {
    expect(linearForecast(5000, 0, 30)).toBe(0)
  })
})
