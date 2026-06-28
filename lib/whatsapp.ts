import type { Transaction } from '@/types'

const EMOJI_MAP: Record<string, string> = {
  Food: '🍽️', Health: '💪', Utilities: '⚡', Transport: '🚗',
  Shopping: '🛍️', Entertainment: '🎬', Investment: '📈',
  Income: '💰', Other: '📝',
}

export function buildConfirmationMessage(tx: Transaction, nudge: string | null): string {
  const emoji = EMOJI_MAP[tx.category] ?? '📝'
  const amount = tx.amount.toLocaleString('en-IN')
  const subcat = tx.subcategory ? ` › ${tx.subcategory}` : ''
  const date = new Date(tx.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  let msg = `✅ ₹${amount} logged\n${emoji} ${tx.category}${subcat}\n📅 ${date}`
  if (nudge) msg += `\n\n💡 ${nudge}`
  return msg
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_TOKEN

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${err}`)
  }
}
