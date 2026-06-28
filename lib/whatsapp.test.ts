import { describe, it, expect, vi, beforeEach } from 'vitest'

global.fetch = vi.fn()

import { sendWhatsAppMessage, buildConfirmationMessage } from './whatsapp'
import type { Transaction } from '@/types'

describe('buildConfirmationMessage', () => {
  it('formats expense confirmation', () => {
    const tx: Transaction = {
      id: '1', user_id: 'u1', amount: 2500, type: 'expense',
      category: 'Health', subcategory: 'Supplements',
      description: 'protein', raw_message: '2500 protein',
      date: '2026-06-28', created_at: '2026-06-28T00:00:00Z', source: 'whatsapp'
    }
    const msg = buildConfirmationMessage(tx, null)
    expect(msg).toContain('₹2,500')
    expect(msg).toContain('Health')
    expect(msg).toContain('logged')
  })

  it('includes coaching nudge when provided', () => {
    const tx: Transaction = {
      id: '1', user_id: 'u1', amount: 2500, type: 'expense',
      category: 'Health', subcategory: 'Supplements',
      description: 'protein', raw_message: '2500 protein',
      date: '2026-06-28', created_at: '2026-06-28T00:00:00Z', source: 'whatsapp'
    }
    const msg = buildConfirmationMessage(tx, '18% above your average')
    expect(msg).toContain('18% above your average')
  })
})

describe('sendWhatsAppMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls Meta API with correct payload', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)
    await sendWhatsAppMessage('919876543210', 'Hello')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('messages'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
