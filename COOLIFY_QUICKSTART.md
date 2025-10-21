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
- **Branch**: `claude/build-whatsapp-ai-agent-011CUKJWSuYaZzNAjD7rNeHB`
- **Auto Deploy**: ✅ Enable

---

## 3. Set Domain

- **Domain**: `ai-agent.astralsup.com` (change to your domain)
- **SSL**: ✅ Auto-provision (Coolify handles this)

---

## 4. Add Environment Variables

Click **"Environment Variables"** and add:

### Must Have (Copy these exactly, replace YOUR-KEY)

```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
ELEVENLABS_API_KEY=sk_YOUR-ACTUAL-KEY-HERE

# Chatwoot
CHATWOOT_URL=https://chatwoot.astralsup.com
CHATWOOT_API_TOKEN=YOUR-CHATWOOT-TOKEN
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1

# Security (Generate strong passwords!)
POSTGRES_PASSWORD=ChangeThisToAStrongPassword123!
JWT_SECRET=ChangeThisToA32CharacterOrLongerSecret
SESSION_SECRET=ChangeThisToAnotherStrongSecret456!
ADMIN_PASSWORD=ChangeThisAdminPassword789!
```

### Already Configured (Optional - only if you want to change)

```env
# These have defaults, you can skip them
NODE_ENV=production
AGENT_NAME=Astral
BUSINESS_NAME=AstralSup
ADMIN_USERNAME=admin
```

---

## 5. Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. ✅ Done!

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
Login: `admin` / Your ADMIN_PASSWORD

### Send Test Message
Send a WhatsApp message to your Chatwoot inbox and watch the AI respond!

---

## Troubleshooting

### Check if it's running:
```
https://ai-agent.astralsup.com/health
```
Should return: `{"status": "healthy"}`

### Check logs:
Coolify Dashboard → Your Project → Logs tab

### Not working?
1. Verify all API keys are correct
2. Check POSTGRES_PASSWORD is the same everywhere
3. Ensure Chatwoot webhook URL is correct
4. View logs in Coolify for errors

---

## Important URLs

| Service | URL |
|---------|-----|
| **AI Agent** | `https://ai-agent.astralsup.com` |
| **Admin Dashboard** | `https://ai-agent.astralsup.com/admin/dashboard` |
| **Health Check** | `https://ai-agent.astralsup.com/health` |
| **Chatwoot Webhook** | `https://ai-agent.astralsup.com/webhook/chatwoot` |

---

## Default Credentials

**Admin Dashboard:**
- Username: `admin` (or your ADMIN_USERNAME)
- Password: Your ADMIN_PASSWORD from environment variables

---

## What Happens After Deploy?

1. **PostgreSQL** starts and auto-creates database tables
2. **PostgREST** starts and provides REST API to database
3. **AI Agent** starts and connects to everything
4. **Chatwoot** sends webhooks when messages arrive
5. **AI** analyzes messages and responds via Chatwoot
6. **Voicemail**: Audio in → Audio out, Text in → Text out

---

## Need More Details?

See **COOLIFY_DEPLOYMENT.md** for complete documentation.

---

**That's it! Your AI agent is live! 🚀**
