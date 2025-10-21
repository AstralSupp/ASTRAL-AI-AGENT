# 🚀 START HERE - ASTRAL AI Agent Setup

## Welcome! Your AI Agent is 90% Ready!

### ✅ What's Already Done

Your `.env` file is configured with:
- **Claude AI** (Anthropic) - The brain of your agent ✅
- **OpenAI Whisper** - For transcribing audio messages ✅
- **ElevenLabs** - For sending voice responses in Portuguese ✅

### 🎯 What You Need to Do (2 Quick Steps)

#### Step 1: Supabase (Database) - 15 minutes
```
1. Go to https://supabase.com
2. Create new project: "astral-ai-agent"
3. Copy 3 values to .env:
   - Project URL
   - anon key
   - service_role key
4. Run SQL migration (copy from supabase/migrations/001_initial_schema.sql)
```
📖 Full instructions: `SUPABASE_SETUP.md`

#### Step 2: Chatwoot (WhatsApp Platform) - 10 minutes
```
1. Get/create Chatwoot instance with WhatsApp
2. Copy 4 values to .env:
   - Chatwoot URL
   - API Token
   - Account ID
   - Inbox ID
3. Set up webhook to your agent URL
```
📖 Full instructions: `CHATWOOT_SETUP.md`

### 📚 All Your Guides

| Document | Purpose |
|----------|---------|
| `NEXT_STEPS.md` | Complete step-by-step walkthrough |
| `SUPABASE_SETUP.md` | Detailed Supabase setup |
| `CHATWOOT_SETUP.md` | Detailed Chatwoot setup |
| `CONFIGURATION_CHECKLIST.md` | Track your progress |
| `README.md` | Full documentation |
| `SETUP.md` | Original setup guide |

### 🏃 Quick Commands

```bash
# Check what's missing in .env
grep -E "your-|TODO" .env

# Install dependencies
npm install

# Load knowledge base
npm run load-knowledge

# Start development server
npm run dev

# Check if running
curl http://localhost:3000/health
```

### 🆘 Need Help?

1. Check the specific guide for your issue
2. Look at the logs: `npm run dev` will show errors
3. Verify environment: `grep -E "your-|TODO" .env` should return nothing

### ⏱️ Time to Production

- Supabase: 15 min
- Chatwoot: 10 min  
- Testing: 5 min
- Deploy: 10 min

**Total: ~40 minutes!**

### 🎉 What Happens When It's Running

Your AI agent will:
1. Receive WhatsApp messages via Chatwoot
2. Wait for customer to finish sending (smart burst detection)
3. Think about the best response using Claude AI
4. Show typing indicator (natural timing)
5. Respond in Portuguese like a human
6. Handle audio messages (transcribe → respond with voice)
7. React with emojis when appropriate (not always!)

### 👉 Start with Step 1: Supabase

Open `SUPABASE_SETUP.md` and let's get your database ready!

Good luck! 🚀🇧🇷
