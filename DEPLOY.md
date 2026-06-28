# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free) 
- Meta Developer account (free)
- Google AI Studio account (free, for Gemini API key)

## Step 1: Supabase Setup (10 min)

1. Go to supabase.com → New Project
2. SQL Editor → paste contents of `supabase/migrations/001_initial.sql` → Run
3. Go to Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Authentication → Email → enable "Magic Link"

## Step 2: Gemini API Key (2 min)

1. Go to aistudio.google.com → Get API Key → Create API Key
2. Copy key → `GEMINI_API_KEY`

## Step 3: Meta WhatsApp Cloud API (30 min)

1. Go to developers.facebook.com → My Apps → Create App → Business
2. Add product: WhatsApp
3. WhatsApp → API Setup → note your Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
4. Generate temporary access token → `WHATSAPP_TOKEN` (replace with permanent later)
5. WhatsApp → Configuration → Webhook:
   - URL: `https://YOUR-APP.vercel.app/api/webhook/whatsapp`
   - Verify token: `finance_tracker_verify_2026`
   - Subscribe to: `messages`

## Step 4: Deploy to Vercel (5 min)

1. Push to GitHub: `git remote add origin https://github.com/YOUR_USER/finance-tracker.git && git push -u origin main`
2. vercel.com → New Project → import GitHub repo
3. Add all environment variables from `.env.local` (with real values)
4. Deploy → note your production URL
5. Update webhook URL in Meta dashboard with production URL

## Step 5: Link Your WhatsApp Number (2 min)

In Supabase SQL Editor:
```sql
-- Run after logging in once via the dashboard
INSERT INTO whatsapp_users (user_id, phone_number)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com'),
  '91XXXXXXXXXX'  -- your number with country code, no +
);
```

## Step 6: Test End-to-End

1. Open your Vercel URL → login with magic link
2. Send WhatsApp message to your business number: `2500 protein`
3. Bot should reply: ✅ ₹2,500 logged 💪 Health › Supplements
4. Refresh dashboard → transaction appears

## Monthly Cost: ₹0

| Service | Free Limit | Your Usage |
|---------|-----------|------------|
| Meta Cloud API | 1000 conversations/month | ~150/month |
| Vercel | Unlimited hobby deploys | Minimal |
| Supabase | 500MB DB | ~5MB/month |
| Gemini 1.5 Flash | 1M tokens/day | ~150 calls/day |
