# Coolify Quick Start - 5 Minutes Setup ⚡

Deploy the WhatsApp AI Agent to Coolify in 5 minutes!

---

## 1. Create Project in Coolify

1. Login to Coolify
2. Click **"New Project"** → Name: `Astral AI Agent`
3. Click **"Add Resource"** → Select **"Docker Compose"**

---

## 2. Connect Repository

- **Repository**: `https://github.com/AstralSupp/ASTRAL-AI-AGENT`
- **Branch**: `claude/build-whatsapp-ai-agent-011CUKJWSuYaZzNAjD7rNeHB` (or `main` after merge)
- **Auto Deploy**: ✅ Enable
- **Build Pack**: Docker Compose

---

## 3. Set Domain

- **Domain**: `ai-agent.astralsup.com` (change to your domain)
- **SSL**: ✅ Auto-provision (Coolify handles this)
- **Port**: `3000` (internal container port)

---

## 4. Add Environment Variables

Click **"Environment Variables"** and add the following:

### 🔵 Coolify Auto-Generated (Just add the variable name, leave value empty)

Coolify will automatically generate secure values for these:

```env
SERVICE_PASSWORD_POSTGRES
SERVICE_PASSWORD_64_JWT
SERVICE_PASSWORD_ADMIN
SERVICE_PASSWORD_64_SESSION
```

### 🔴 Required (You must set these)

```env
# Chatwoot
CHATWOOT_URL=https://chatwoot.astralsup.com
CHATWOOT_API_TOKEN=your-chatwoot-token-here
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1

# AI Service API Keys
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
ELEVENLABS_API_KEY=sk_YOUR-KEY-HERE
```

### ⚪ Optional (Has defaults, only set if you want to change)

```env
# Agent Customization
AGENT_NAME=Astral
BUSINESS_NAME=AstralSup
BUSINESS_DESCRIPTION=Empresa brasileira de atendimento ao cliente

# Voice
ELEVENLABS_VOICE_ID=yoiZfrc4wQ9Rs1QGpnm5

# Admin
ADMIN_USERNAME=admin
```

---

## 5. Deploy!

1. Click **"Deploy"** button
2. Coolify will:
   - ✅ Pull the latest code
   - ✅ Build the Docker images
   - ✅ Auto-generate passwords
   - ✅ Start all services (postgres → rest → app)
   - ✅ Provision SSL certificate
3. Wait 2-3 minutes for build to complete
4. ✅ Done!

---

## 6. Configure Chatwoot Webhook

1. Go to Chatwoot: `https://chatwoot.astralsup.com`
2. Settings → Integrations → Webhooks → **Add Webhook**
3. **URL**: `https://ai-agent.astralsup.com/webhook/chatwoot`
4. **Events**: Select `message_created`
5. Click **"Create"**

---

## 7. Test It! 🎉

### Access Admin Dashboard
```
https://ai-agent.astralsup.com/admin/dashboard
```
- **Username**: `admin` (or your ADMIN_USERNAME)
- **Password**: Check Coolify environment variable `SERVICE_PASSWORD_ADMIN`

### Send Test Message
Send a WhatsApp message to your Chatwoot inbox and watch the AI respond!

---

## How It Works

```
WhatsApp → Chatwoot → Webhook → AI Agent
                                    ↓
                        1. Detects message burst
                        2. AI analyzes with Claude
                        3. Responds via Chatwoot
                                    ↓
                        PostgreSQL ← Logs everything
```

---

## Troubleshooting

### Check if it's running:
```
https://ai-agent.astralsup.com/health
```
**Expected response:**
```json
{"status": "healthy", "timestamp": "..."}
```

### Check logs in Coolify:
1. Go to your project in Coolify
2. Click **"Logs"** tab
3. Select service:
   - **postgres**: Database logs
   - **rest**: PostgREST API logs
   - **app**: AI Agent logs

### Common Issues:

**503 Service Unavailable**
- Wait for all services to be healthy (check Logs tab)
- Verify postgres started successfully
- Check if database migrations ran

**Webhook not working**
- Verify CHATWOOT_URL is correct
- Check CHATWOOT_API_TOKEN is valid
- Ensure domain SSL is working
- Check app logs for webhook requests

**AI not responding**
- Verify API keys are correct (Anthropic, OpenAI, ElevenLabs)
- Check app logs for API errors
- Ensure APIs have available credits

---

## Important URLs

| Service | URL |
|---------|-----|
| **AI Agent** | `https://ai-agent.astralsup.com` |
| **Admin Dashboard** | `https://ai-agent.astralsup.com/admin/dashboard` |
| **Health Check** | `https://ai-agent.astralsup.com/health` |
| **Chatwoot Webhook** | `https://ai-agent.astralsup.com/webhook/chatwoot` |

---

## What Coolify Does Automatically

✅ **Auto-generates secure passwords** for:
- PostgreSQL database
- JWT secrets
- Admin password
- Session secrets

✅ **Auto-provisions SSL** certificate (Let's Encrypt)

✅ **Auto-builds** Docker images from your repository

✅ **Auto-initializes** database with tables and schema

✅ **Auto-restarts** services if they crash

✅ **Health checks** all services continuously

---

## Environment Variable Reference

### Coolify Auto-Generated Variables

| Variable | Purpose | Auto-Generated? |
|----------|---------|-----------------|
| `SERVICE_PASSWORD_POSTGRES` | PostgreSQL password | ✅ Yes |
| `SERVICE_PASSWORD_64_JWT` | JWT secret (32+ chars) | ✅ Yes |
| `SERVICE_PASSWORD_ADMIN` | Admin dashboard password | ✅ Yes |
| `SERVICE_PASSWORD_64_SESSION` | Session secret | ✅ Yes |

### Required Variables (You must set)

| Variable | Example | Where to get |
|----------|---------|--------------|
| `CHATWOOT_URL` | `https://chatwoot.astralsup.com` | Your Chatwoot URL |
| `CHATWOOT_API_TOKEN` | `7qNGm4ixCxpqQRrQ5Erh4rv5` | Chatwoot Settings → API |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | https://console.anthropic.com |
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com |
| `ELEVENLABS_API_KEY` | `sk_...` | https://elevenlabs.io |

---

## Next Steps After Deployment

1. ✅ Test the health endpoint
2. ✅ Login to admin dashboard
3. ✅ Configure Chatwoot webhook
4. ✅ Send a test WhatsApp message
5. ✅ Monitor logs in Coolify
6. ✅ Check admin dashboard for activity

---

## Need More Details?

- **Complete Guide**: See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)
- **Environment Variables**: See [.env.coolify](./.env.coolify)
- **General README**: See [README.md](./README.md)

---

**That's it! Your AI agent is live on Coolify! 🚀**

The agent will now:
- 📱 Receive WhatsApp messages via Chatwoot
- 🤖 Analyze them with Claude AI
- 🎤 Transcribe voice messages with Whisper
- 🔊 Respond with voice via ElevenLabs
- 💬 Match response type (audio→audio, text→text)
- 📊 Log everything to PostgreSQL
