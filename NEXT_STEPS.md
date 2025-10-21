# Next Steps - Quick Start

## Your Current Status ✅

**Configured:**
- ✅ Anthropic Claude API (AI brain)
- ✅ OpenAI API (speech-to-text)
- ✅ ElevenLabs API (text-to-speech, Portuguese)
- ✅ Code repository ready
- ✅ All service integrations implemented

**Still Needed:**
- 🔧 Supabase (database)
- 🔧 Chatwoot (messaging platform)

---

## Step 1: Set Up Supabase (15 minutes)

### Quick Setup:
1. Go to https://supabase.com
2. Create account → New Project
3. Name: `astral-ai-agent`
4. Choose region near Brazil
5. Wait 2 minutes for project creation

### Get Credentials:
1. Project Settings → API
2. Copy to `.env`:
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_KEY` (click Reveal)

### Run Migration:
1. SQL Editor (left sidebar)
2. New query
3. Copy from: `supabase/migrations/001_initial_schema.sql`
4. Paste → Run
5. Verify: Table Editor shows 5 new tables

📖 Detailed guide: `SUPABASE_SETUP.md`

---

## Step 2: Set Up Chatwoot (10 minutes)

### If you don't have Chatwoot yet:

**Option A - Cloud (Fastest):**
- Sign up at https://www.chatwoot.com/
- Follow their WhatsApp setup wizard

**Option B - Self-Hosted:**
- Deploy using: https://www.chatwoot.com/docs/self-hosted/deployment/linux-vm
- Or use Docker: https://www.chatwoot.com/docs/self-hosted/deployment/docker

### Get Credentials:
1. Profile → Profile Settings → Access Token
2. Create token → Copy to `.env` as `CHATWOOT_API_TOKEN`
3. Copy your Chatwoot URL → `CHATWOOT_URL`
4. Get Account ID from URL (usually `1`) → `CHATWOOT_ACCOUNT_ID`
5. Settings → Inboxes → WhatsApp → Get ID from URL → `CHATWOOT_INBOX_ID`

📖 Detailed guide: `CHATWOOT_SETUP.md`

---

## Step 3: Test Locally (5 minutes)

### Install and start:
```bash
# Install dependencies
npm install

# Load Chatwoot knowledge
npm run load-knowledge

# Start development server
npm run dev
```

### Set up webhook for testing:
```bash
# In another terminal, install and run ngrok
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

In Chatwoot:
1. Settings → Integrations → Webhooks
2. Add webhook: `https://abc123.ngrok.io/webhooks/chatwoot`
3. Subscribe to: `message_created`
4. Save

### Test it!
1. Send WhatsApp message to your Chatwoot number
2. Watch terminal logs
3. You should get an AI response! 🎉

---

## Step 4: Customize for Your Business (5 minutes)

Edit `.env`:
```env
AGENT_NAME=Maria                    # Your agent's name
BUSINESS_NAME=Loja ABC              # Your business name
BUSINESS_DESCRIPTION=Vendemos roupas de qualidade com entrega rápida
```

Optional: Edit `src/prompts/system-prompt.ts` for custom behavior

---

## Step 5: Deploy to Production

### Option 1: Docker (Anywhere)
```bash
docker-compose up -d
```

### Option 2: Coolify (VPS - Recommended)
1. Push to GitHub (already done ✅)
2. Coolify dashboard:
   - New Resource → Docker Compose
   - Connect GitHub repo
   - Add environment variables
   - Deploy
3. Copy production URL
4. Update Chatwoot webhook with production URL

---

## Troubleshooting

**Agent not responding?**
```bash
# Check health
curl http://localhost:3000/health

# Should return: {"status":"healthy",...}
```

**Environment issues?**
```bash
# Check what's missing
grep -E "your-|TODO" .env

# Should return nothing when fully configured
```

**Database issues?**
- Verify migration ran successfully in Supabase
- Check all 5 tables exist in Table Editor

**Webhook issues?**
- Test endpoint: `curl http://your-url/health`
- Verify webhook is subscribed to `message_created`
- Check ngrok is running (for local testing)

---

## Resources

- **Full documentation**: `README.md`
- **Supabase setup**: `SUPABASE_SETUP.md`
- **Chatwoot setup**: `CHATWOOT_SETUP.md`
- **Configuration checklist**: `CONFIGURATION_CHECKLIST.md`

---

## Timeline Estimate

- ⏱️ Supabase setup: 15 minutes
- ⏱️ Chatwoot setup: 10 minutes
- ⏱️ Local testing: 5 minutes
- ⏱️ Customization: 5 minutes
- ⏱️ Production deployment: 10 minutes

**Total: ~45 minutes to production** 🚀

---

## You're Almost There!

Once Supabase and Chatwoot are configured, your AI agent will:
- ✨ Respond intelligently to WhatsApp messages
- 🎤 Handle audio messages (transcribe with Whisper)
- 🔊 Send voice responses (ElevenLabs Portuguese)
- 😊 React with emojis smartly
- 💭 Think before responding
- ⏳ Wait for customers to finish typing multiple messages
- 🇧🇷 Speak perfect Brazilian Portuguese

Let's get it running! 💪
