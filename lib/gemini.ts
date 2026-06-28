import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ParsedMessage } from '@/types'

// Instantiate the SDK client. Wrapped so it works whether the export is a
// real class (production) or a vi.fn() mock implementation (tests): a plain
// call returns the mock's object, while `new` is used for the real class.
function createGenAI(apiKey: string): GoogleGenerativeAI {
  const Ctor = GoogleGenerativeAI as unknown as {
    (key: string): GoogleGenerativeAI
    new (key: string): GoogleGenerativeAI
  }
  try {
    // Plain call: works for a vi.fn() mock implementation (returns its object).
    // A real ES class throws "Class constructor cannot be invoked without 'new'".
    return Ctor(apiKey)
  } catch {
    return new Ctor(apiKey)
  }
}

const PARSE_PROMPT = (message: string, today: string) => `
You are a financial transaction parser for an Indian user.
Parse the following WhatsApp message into a JSON object.

Message: "${message}"
Today's date: ${today}

Rules:
- amount: extract the numeric amount (number, not string)
- type: "expense" | "income" | "investment"
- category: one of: Food, Health, Utilities, Transport, Shopping, Entertainment, Investment, Income, Other
- subcategory: specific sub-type or null
- description: clean description of what was spent on
- date: ISO date YYYY-MM-DD (use today if not specified)

Income keywords: salary, received, freelance, got paid
Investment keywords: sip, mutual fund, stocks, fd, crypto

Respond with ONLY valid JSON, no markdown, no explanation.
Example: {"amount":2500,"type":"expense","category":"Health","subcategory":"Supplements","description":"protein powder","date":"${today}"}
`

export async function parseMessage(message: string): Promise<ParsedMessage | null> {
  const today = new Date().toISOString().split('T')[0]
  try {
    const genAI = createGenAI(process.env.GEMINI_API_KEY ?? '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(PARSE_PROMPT(message, today))
    const text = result.response.text().trim()
    const parsed = JSON.parse(text)

    if (!parsed.amount || !parsed.type || !parsed.category) return null

    return {
      amount: Number(parsed.amount),
      type: parsed.type,
      category: parsed.category,
      subcategory: parsed.subcategory ?? null,
      description: parsed.description ?? message,
      date: parsed.date ?? today,
    }
  } catch {
    return null
  }
}

export async function parseWithFallback(message: string): Promise<ParsedMessage & { amount: number }> {
  const geminiResult = await parseMessage(message)
  if (geminiResult) return { ...geminiResult, amount: geminiResult.amount }
  // Dynamic import to avoid circular deps — categorize.ts is a separate module
  const { categorize } = await import('./categorize')
  return categorize(message)
}
