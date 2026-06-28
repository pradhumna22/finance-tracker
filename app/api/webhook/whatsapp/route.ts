import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { parseWithFallback } from '@/lib/gemini'
import { sendWhatsAppMessage, buildConfirmationMessage } from '@/lib/whatsapp'
import { generateNudge } from '@/lib/coach'

// GET: Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

async function verifyWebhookSignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const signature = req.headers.get('x-hub-signature-256')
  const appSecret = process.env.WHATSAPP_APP_SECRET

  if (!signature || !appSecret) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const expectedSig = 'sha256=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedSig
}

// POST: Receive WhatsApp messages
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!await verifyWebhookSignature(req, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)

  try {
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const message = change?.value?.messages?.[0]

    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' })
    }

    const from = message.from as string
    const text = message.text.body as string

    const supabase = createServiceClient()

    // Resolve user from phone number
    const { data: waUser } = await supabase
      .from('whatsapp_users')
      .select('user_id')
      .eq('phone_number', from)
      .single()

    if (!waUser) {
      await sendWhatsAppMessage(from, "👋 Hi! Your number isn't linked yet. Visit the app to connect your WhatsApp.")
      return NextResponse.json({ status: 'unregistered' })
    }

    const userId = waUser.user_id
    const lower = text.trim().toLowerCase()

    if (lower === 'summary') return handleSummaryCommand(from, userId, supabase)
    if (lower === 'last 5') return handleLast5Command(from, userId, supabase)
    if (lower === 'delete last') return handleDeleteLastCommand(from, userId, supabase)
    if (lower === 'help') {
      await sendWhatsAppMessage(from, HELP_TEXT)
      return NextResponse.json({ status: 'ok' })
    }

    // Parse transaction
    const parsed = await parseWithFallback(text)

    if (!parsed.amount || parsed.amount === 0) {
      await sendWhatsAppMessage(from, "❓ Couldn't find an amount. Try: *2500 protein* or *500 zomato*")
      return NextResponse.json({ status: 'parse_failed' })
    }

    const { data: tx, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        subcategory: parsed.subcategory,
        description: parsed.description,
        raw_message: text,
        date: parsed.date,
        source: 'whatsapp',
      })
      .select()
      .single()

    if (error || !tx) {
      await sendWhatsAppMessage(from, '⚠️ Failed to save. Please try again.')
      return NextResponse.json({ status: 'db_error' })
    }

    const nudge = await getCategoryNudge(userId, parsed.category, supabase)
    const confirmMsg = buildConfirmationMessage(tx, nudge)
    await sendWhatsAppMessage(from, confirmMsg)

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

const HELP_TEXT = `📱 *Finance Tracker Commands*

Log expenses:
• *2500 protein* — expense
• *500 zomato* — food outside
• *1200 electricity* — utility

Log income/investments:
• *50000 salary* — income
• *5000 sip* — investment

Commands:
• *summary* — this month's snapshot
• *last 5* — recent transactions
• *delete last* — remove last entry
• *help* — this message`

async function getCategoryNudge(userId: string, category: string, supabase: ReturnType<typeof createServiceClient>): Promise<string | null> {
  const now = new Date()
  const thisMonth = now.getMonth() + 1
  const thisYear = now.getFullYear()

  const { data: currentRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('type', 'expense')
    .gte('date', `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`)

  const currentSpend = (currentRows ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)

  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: histRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('type', 'expense')
    .lt('date', `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`)
    .gte('date', threeMonthsAgo.toISOString().split('T')[0])

  const histTotal = (histRows ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)
  const avgMonthly = histRows && histRows.length > 0 ? histTotal / 3 : 0

  if (avgMonthly === 0) return null
  return generateNudge(category, currentSpend, avgMonthly)
}

async function handleSummaryCommand(from: string, userId: string, supabase: ReturnType<typeof createServiceClient>) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`

  const { data: rows } = await supabase
    .from('transactions')
    .select('amount,type')
    .eq('user_id', userId)
    .gte('date', startDate)

  const income = (rows ?? []).filter((r: { type: string }) => r.type === 'income').reduce((s: number, r: { amount: number }) => s + r.amount, 0)
  const expense = (rows ?? []).filter((r: { type: string }) => r.type === 'expense').reduce((s: number, r: { amount: number }) => s + r.amount, 0)
  const investment = (rows ?? []).filter((r: { type: string }) => r.type === 'investment').reduce((s: number, r: { amount: number }) => s + r.amount, 0)
  const saved = income - expense - investment

  const msg = `📊 *This Month's Summary*\n\n💰 Income: ₹${income.toLocaleString('en-IN')}\n💸 Expenses: ₹${expense.toLocaleString('en-IN')}\n📈 Investments: ₹${investment.toLocaleString('en-IN')}\n🏦 Saved: ₹${saved.toLocaleString('en-IN')}`
  await sendWhatsAppMessage(from, msg)
  return NextResponse.json({ status: 'ok' })
}

async function handleLast5Command(from: string, userId: string, supabase: ReturnType<typeof createServiceClient>) {
  const { data: rows } = await supabase
    .from('transactions')
    .select('amount,type,category,description,date')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!rows || rows.length === 0) {
    await sendWhatsAppMessage(from, 'No transactions yet.')
    return NextResponse.json({ status: 'ok' })
  }

  const lines = rows.map((r: { amount: number; description: string; category: string }) =>
    `• ₹${r.amount.toLocaleString('en-IN')} — ${r.description} (${r.category})`
  ).join('\n')
  await sendWhatsAppMessage(from, `🧾 *Last 5 Transactions*\n\n${lines}`)
  return NextResponse.json({ status: 'ok' })
}

async function handleDeleteLastCommand(from: string, userId: string, supabase: ReturnType<typeof createServiceClient>) {
  const { data: last } = await supabase
    .from('transactions')
    .select('id,description,amount')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!last) {
    await sendWhatsAppMessage(from, 'No transactions to delete.')
    return NextResponse.json({ status: 'ok' })
  }

  await supabase.from('transactions').delete().eq('id', last.id)
  await sendWhatsAppMessage(from, `🗑️ Deleted: ₹${last.amount.toLocaleString('en-IN')} — ${last.description}`)
  return NextResponse.json({ status: 'ok' })
}
