# Configuration Checklist

Use this checklist to track your setup progress.

## ✅ Already Configured

- [x] Anthropic API Key (Claude)
- [x] OpenAI API Key (Whisper)
- [x] ElevenLabs API Key
- [x] Project structure created
- [x] Code repository ready

## 🔧 Still Need to Configure

### 1. ElevenLabs Voice ID
- [ ] Go to https://elevenlabs.io/app/voice-library
- [ ] Find a Portuguese (Brazilian) voice
- [ ] Copy Voice ID
- [ ] Add to `.env` file as `ELEVENLABS_VOICE_ID`

**Recommended voices:**
- Matheus (Male, Brazilian)
- Camila (Female, Brazilian)
- Or use default: `21m00Tcm4TlvDq8ikWAM`

---

### 2. Supabase Setup
- [ ] Create Supabase account: https://supabase.com
- [ ] Create new project (name: astral-ai-agent)
- [ ] Get credentials from Settings → API:
  - [ ] Copy Project URL → `SUPABASE_URL`
  - [ ] Copy anon public key → `SUPABASE_ANON_KEY`
  - [ ] Copy service_role key → `SUPABASE_SERVICE_KEY`
- [ ] Run database migration (SQL Editor)
  - [ ] Open `supabase/migrations/001_initial_schema.sql`
  - [ ] Copy all SQL
  - [ ] Paste in Supabase SQL Editor
  - [ ] Click "Run"
- [ ] Verify 5 tables created in Table Editor

📖 See detailed guide: `SUPABASE_SETUP.md`

---

### 3. Chatwoot Setup
- [ ] Have Chatwoot instance (cloud or self-hosted)
- [ ] Connect WhatsApp to Chatwoot
- [ ] Get API Access Token:
  - [ ] Profile Settings → Access Token
  - [ ] Create new token
  - [ ] Copy to `.env` as `CHATWOOT_API_TOKEN`
- [ ] Get Account ID (from URL, usually `1`)
  - [ ] Add to `.env` as `CHATWOOT_ACCOUNT_ID`
- [ ] Get WhatsApp Inbox ID
  - [ ] Settings → Inboxes → WhatsApp inbox
  - [ ] Copy ID from URL
  - [ ] Add to `.env` as `CHATWOOT_INBOX_ID`
- [ ] Copy Chatwoot URL to `.env` as `CHATWOOT_URL`

📖 See detailed guide: `CHATWOOT_SETUP.md`

---

### 4. Customize for Your Business
- [ ] Update in `.env`:
  - [ ] `AGENT_NAME` (e.g., "Maria", "João")
  - [ ] `BUSINESS_NAME` (your company name)
  - [ ] `BUSINESS_DESCRIPTION` (what your business does)
- [ ] Optional: Customize prompts in `src/prompts/system-prompt.ts`

---

## 🚀 Ready to Test?

Once you've completed the checklist above:

### Local Testing

```bash
# Install dependencies
npm install

# Load Chatwoot knowledge into database
npm run load-knowledge

# Start development server
npm run dev
```

### Configure Webhook (for local testing)

```bash
# In another terminal, start ngrok
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Go to Chatwoot → Settings → Integrations → Webhooks
# Add webhook: https://abc123.ngrok.io/webhooks/chatwoot
# Subscribe to: message_created
```

### Test It!

1. Send a WhatsApp message to your Chatwoot number
2. Watch the agent logs
3. You should receive an intelligent response!

---

## 🐳 Deploy to Production

After local testing works:

### Option 1: Docker Compose
```bash
# Update .env with production values
docker-compose up -d
```

### Option 2: Coolify (VPS)
1. Push code to GitHub (already done ✅)
2. In Coolify:
   - New Resource → Docker Compose
   - Connect repository
   - Add environment variables
   - Deploy
3. Update Chatwoot webhook with production URL

---

## 🆘 Need Help?

- **Supabase issues**: See `SUPABASE_SETUP.md`
- **Chatwoot issues**: See `CHATWOOT_SETUP.md`
- **Quick setup**: See `SETUP.md`
- **Full documentation**: See `README.md`

---

## Current .env Status

Check your `.env` file - you should have all these filled in:

```bash
# Quick check - this should show only TODOs remaining
grep "TODO\|your-" .env
```

Once you see no TODOs or placeholders, you're ready to go! 🎉
