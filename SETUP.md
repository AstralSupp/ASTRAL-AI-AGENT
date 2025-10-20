# Quick Setup Guide

This guide will help you get ASTRAL AI Agent up and running quickly.

## Step 1: Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Supabase account (free tier works)
- [ ] Chatwoot instance (self-hosted or cloud)
- [ ] WhatsApp Business API connected to Chatwoot
- [ ] Anthropic API key
- [ ] OpenAI API key
- [ ] ElevenLabs API key

## Step 2: Get API Keys

### Anthropic (Claude)
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### OpenAI (Whisper)
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-`)

### ElevenLabs (Text-to-Speech)
1. Go to https://elevenlabs.io
2. Sign up or log in
3. Navigate to Profile → API Keys
4. Copy your API key
5. Go to Voices → Select a Portuguese voice
6. Copy the Voice ID

### Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Project Settings → API
4. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Chatwoot
1. Log in to your Chatwoot instance
2. Go to Profile Settings → Access Token
3. Create a new token
4. Copy the token
5. Note your Account ID and Inbox ID (visible in URL)

## Step 3: Install & Configure

```bash
# Clone repository
git clone https://github.com/AstralSupp/ASTRAL-AI-AGENT.git
cd ASTRAL-AI-AGENT

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

## Step 4: Set Up Database

1. Open Supabase SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run in SQL Editor
4. Verify tables were created

## Step 5: Load Knowledge Base

```bash
npm run load-knowledge
```

This loads Chatwoot documentation into the AI's knowledge base.

## Step 6: Configure Chatwoot Webhook

1. In Chatwoot: Settings → Integrations → Webhooks
2. Click "Add new webhook"
3. Enter webhook URL: `https://your-domain.com/webhooks/chatwoot`
4. Subscribe to events: `message_created`
5. Save

**Note**: If testing locally, use ngrok:
```bash
ngrok http 3000
# Use the ngrok URL for the webhook
```

## Step 7: Run the Agent

### Local Development
```bash
npm run dev
```

### Production with Docker
```bash
docker-compose up -d
```

### Deploy to Coolify
1. Push code to GitHub
2. In Coolify: New Resource → Docker Compose
3. Connect repository
4. Add environment variables
5. Deploy

## Step 8: Test

1. Send a WhatsApp message to your Chatwoot number
2. Check agent logs:
   ```bash
   npm run dev  # or
   docker logs -f astral-ai-agent
   ```
3. Verify response arrives in WhatsApp

## Troubleshooting

### Agent not responding?

**Check webhook**:
```bash
curl -X POST http://localhost:3000/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{"event":"message_created","content":"test"}'
```

**Check health**:
```bash
curl http://localhost:3000/health
```

**Check logs**:
```bash
# Docker
docker logs astral-ai-agent

# Local
npm run dev  # errors will appear in console
```

### Common Issues

**"Missing environment variables"**
- Verify all required variables in `.env`
- Check for typos in variable names
- Ensure no extra spaces around `=`

**"Database connection failed"**
- Verify Supabase URL and keys
- Check if database migration ran successfully
- Ensure service_role key is used (not anon key)

**"Chatwoot webhook not working"**
- Verify webhook URL is accessible from internet
- Check webhook is subscribed to `message_created`
- Test with ngrok if running locally

**"Audio not transcribing"**
- Verify OpenAI API key is correct
- Check if Chatwoot is sending audio file URLs
- Ensure audio files are accessible (not behind auth)

## Configuration Tips

### For Brazilian Business

```env
AGENT_NAME=Maria
BUSINESS_NAME=Loja XYZ
BUSINESS_DESCRIPTION=Loja de roupas online com entrega rápida para todo o Brasil
BUSINESS_LANGUAGE=pt-BR
```

### Adjust Response Speed

```env
# Faster responses (more robotic)
MESSAGE_BURST_DELAY_MS=1000
TYPING_SPEED_CPS=100

# Slower responses (more human-like)
MESSAGE_BURST_DELAY_MS=5000
TYPING_SPEED_CPS=30
```

### Choose ElevenLabs Voice

Popular Portuguese voices:
- **Matheus**: Male, Brazilian, professional
- **Camila**: Female, Brazilian, friendly
- **Antonio**: Male, Brazilian, mature

Test voices at https://elevenlabs.io/voice-library

## Next Steps

1. **Customize prompts** in `src/prompts/system-prompt.ts`
2. **Add business knowledge** to the knowledge base
3. **Monitor conversations** in Supabase dashboard
4. **Analyze agent decisions** in `agent_decisions` table
5. **Fine-tune behavior** by adjusting environment variables

## Need Help?

- Check README.md for detailed documentation
- Review logs for error messages
- Test each component individually
- Open an issue on GitHub

---

Happy deploying! 🚀
