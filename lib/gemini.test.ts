import { describe, it, expect, vi } from 'vitest'

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            amount: 2500,
            type: 'expense',
            category: 'Health',
            subcategory: 'Supplements',
            description: 'protein powder',
            date: '2026-06-28',
          }),
        },
      }),
    }),
  })),
}))

import { parseMessage } from './gemini'

describe('parseMessage', () => {
  it('returns parsed transaction from Gemini response', async () => {
    const result = await parseMessage('2500 protein')
    expect(result?.amount).toBe(2500)
    expect(result?.category).toBe('Health')
    expect(result?.type).toBe('expense')
  })

  it('returns null on invalid JSON from Gemini', async () => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const mockModel = {
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'not json' }
      })
    }
    vi.mocked(GoogleGenerativeAI).mockImplementationOnce(() => ({
      getGenerativeModel: () => mockModel,
    }) as any)

    const result = await parseMessage('gibberish text here')
    expect(result).toBeNull()
  })
})
