# Coolify Deployment Guide - ASTRAL AI Agent

This guide will help you deploy the WhatsApp AI Agent to Coolify VPS with a custom domain.

## Prerequisites

- Coolify instance running on your VPS
- GitHub repository connected to Coolify
- Domain configured (e.g., `ai-agent.astralsup.com`)
- API keys for:
  - Anthropic Claude
  - OpenAI (Whisper)
  - ElevenLabs
  - Chatwoot

---

## Step 1: Create New Project in Coolify

1. **Login to Coolify Dashboard**
   - Navigate to your Coolify instance

2. **Create New Project**
   - Click "New Project"
   - Name: `Astral AI Agent`
   - Click "Create"

3. **Add New Resource**
   - Click "Add Resource"
   - Select "Docker Compose"

---

## Step 2: Configure Git Repository

1. **Connect Repository**
   - Repository: `https://github.com/AstralSupp/ASTRAL-AI-AGENT`
   - Branch: `claude/build-whatsapp-ai-agent-011CUKJWSuYaZzNAjD7rNeHB` (or `main` after merging)
   - Select "Auto Deploy on Git Push"

2. **Build Configuration**
   - Build Pack: `Docker Compose`
   - Docker Compose File: `docker-compose.yml` (default)

---

## Step 3: Configure Domain

1. **Set Domain**
   - Domain: `ai-agent.astralsup.com` (or your preferred subdomain)
   - Enable SSL: ✅ (Coolify will auto-provision Let's Encrypt)

2. **Port Mapping**
   - Container Port: `3000`
   - Public Port: `443` (HTTPS)

---

## Step 4: Configure Environment Variables

In Coolify, go to **Environment Variables** section and add:

### Required Variables

```bash
# AI Service API Keys (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
ELEVENLABS_API_KEY=sk_YOUR-ACTUAL-KEY-HERE

# Chatwoot Configuration (REQUIRED)
CHATWOOT_URL=https://chatwoot.astralsup.com
CHATWOOT_API_TOKEN=YOUR-CHATWOOT-TOKEN
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1

# Database & Security (REQUIRED - CHANGE THESE!)
POSTGRES_PASSWORD=generate-a-strong-password-here
JWT_SECRET=generate-a-32-character-or-longer-secret
SESSION_SECRET=generate-another-strong-secret
ADMIN_PASSWORD=your-secure-admin-password
```

### Optional Variables (with defaults)

```bash
# Server
NODE_ENV=production
PORT=3000

# Agent Configuration
AGENT_NAME=Astral
BUSINESS_NAME=AstralSup
BUSINESS_DESCRIPTION=Empresa brasileira de atendimento ao cliente com inteligência artificial
BUSINESS_LANGUAGE=pt-BR

# AI Model Selection
CLAUDE_MODEL=claude-3-5-sonnet-20241022
ELEVENLABS_VOICE_ID=yoiZfrc4wQ9Rs1QGpnm5

# Message Handling
MESSAGE_BURST_DELAY_MS=3000
TYPING_SPEED_CPS=50
MAX_TYPING_INDICATOR_MS=10000

# Admin Dashboard
ADMIN_USERNAME=admin
```

### Supabase Keys (Auto-configured, don't change unless you know what you're doing)

```bash
SUPABASE_URL=http://rest:3000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
```

---

## Step 5: Configure Persistent Volumes

Coolify should auto-detect volumes from `docker-compose.yml`, but verify:

1. **postgres_data**: PostgreSQL database storage
   - Path: `/var/lib/postgresql/data`
   - Size: At least 5GB recommended

2. **logs**: Application logs
   - Path: `/app/logs`
   - Size: 1GB recommended

---

## Step 6: Deploy

1. **Click "Deploy"** in Coolify
2. **Monitor Build Logs** - You should see:
   ```
   ✓ postgres service started
   ✓ rest (PostgREST) service started
   ✓ app service started
   ✓ Database migrations executed
   ```

3. **Wait for Health Check** - The app service will be healthy when:
   ```
   GET /health returns 200 OK
   ```

---

## Step 7: Verify Deployment

### Check Admin Dashboard
1. Navigate to: `https://ai-agent.astralsup.com/admin/login`
2. Login with credentials:
   - Username: `admin` (or your ADMIN_USERNAME)
   - Password: Your ADMIN_PASSWORD

### Check Webhook Endpoint
1. Test endpoint: `https://ai-agent.astralsup.com/health`
2. Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-10-21T...",
     "service": "astral-ai-agent"
   }
   ```

---

## Step 8: Configure Chatwoot Webhook

1. **Go to Chatwoot Dashboard**
   - Navigate to: `https://chatwoot.astralsup.com`
   - Login as admin

2. **Configure Webhook**
   - Settings → Integrations → Webhooks
   - Click "Add Webhook"
   - URL: `https://ai-agent.astralsup.com/webhook/chatwoot`
   - Events: Select "message_created"
   - Click "Create"

3. **Test Webhook**
   - Send a message on WhatsApp to your Chatwoot inbox
   - Check Admin Dashboard logs to verify message processing

---

## Step 9: Monitor & Troubleshoot

### View Application Logs
In Coolify, go to **Logs** tab to see real-time logs from all containers:
- `postgres`: Database logs
- `rest`: PostgREST API logs
- `app`: AI Agent application logs

### View Admin Dashboard
Navigate to: `https://ai-agent.astralsup.com/admin/dashboard`

You'll see:
- Total conversations
- Total messages
- Agent decisions
- Recent activity logs
- Error logs (if any)

### Common Issues

#### 1. **503 Service Unavailable**
- Check if all containers are running: `docker ps`
- Check health status in Coolify
- Verify database migrations completed

#### 2. **Webhook Not Working**
- Verify webhook URL in Chatwoot is correct
- Check if domain SSL is working
- View app logs for incoming webhook requests

#### 3. **AI Not Responding**
- Verify API keys are correct
- Check app logs for API errors
- Ensure Anthropic/OpenAI/ElevenLabs keys have credits

#### 4. **Database Connection Issues**
- Verify POSTGRES_PASSWORD matches in all services
- Check if postgres container is healthy
- Check database init logs for migration errors

---

## Architecture Overview

```
Internet
    ↓
Coolify Proxy (Traefik)
    ↓ (HTTPS/SSL)
ai-agent.astralsup.com
    ↓
┌─────────────────────────────────────┐
│  Docker Compose Stack               │
│                                     │
│  ┌──────────┐     ┌──────────┐    │
│  │ postgres │ ←── │   rest   │    │
│  │  (DB)    │     │(PostgREST)│   │
│  └──────────┘     └─────┬────┘    │
│                          ↑          │
│                    ┌─────┴────┐    │
│                    │   app    │    │
│                    │(AI Agent)│    │
│                    └──────────┘    │
│                          ↓          │
└──────────────────────────┼─────────┘
                           ↓
                    External APIs
                 (Claude, OpenAI, etc.)
```

---

## Updating the Application

### Via Git Push (Automatic)
If you enabled "Auto Deploy on Git Push":
1. Push changes to your branch
2. Coolify will automatically rebuild and redeploy
3. Zero downtime with rolling updates

### Manual Update
1. Go to Coolify Dashboard
2. Click "Redeploy"
3. Monitor build logs

---

## Scaling & Performance

### Resource Recommendations

**Minimum VPS Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD

**Recommended for Production:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD

### Performance Tuning

1. **PostgreSQL** - Increase `shared_buffers` if handling many conversations
2. **PostgREST** - Add connection pooling if API gets heavy load
3. **App Container** - Scale horizontally by adding more app containers

---

## Backup & Recovery

### Database Backups

Coolify can schedule automatic backups. To manually backup:

```bash
# Backup PostgreSQL
docker exec astral-postgres pg_dump -U postgres postgres > backup.sql

# Restore
docker exec -i astral-postgres psql -U postgres postgres < backup.sql
```

### Environment Variables Backup
Export all environment variables from Coolify dashboard and store securely.

---

## Security Checklist

- ✅ Change default ADMIN_PASSWORD
- ✅ Generate strong POSTGRES_PASSWORD
- ✅ Generate unique JWT_SECRET (32+ chars)
- ✅ Generate unique SESSION_SECRET
- ✅ Enable SSL/HTTPS (Coolify auto-provision)
- ✅ Keep API keys secure (never commit to git)
- ✅ Regularly update dependencies
- ✅ Monitor logs for suspicious activity
- ✅ Enable Coolify firewall rules

---

## Support

If you encounter issues:

1. **Check Logs**: Coolify Dashboard → Logs tab
2. **Check Health**: `https://ai-agent.astralsup.com/health`
3. **Check Admin Dashboard**: `https://ai-agent.astralsup.com/admin/dashboard`
4. **Review GitHub Issues**: [Create an issue](https://github.com/AstralSupp/ASTRAL-AI-AGENT/issues)

---

## Success! 🎉

Your WhatsApp AI Agent is now deployed and running on Coolify!

**Next Steps:**
1. Test by sending messages to your WhatsApp via Chatwoot
2. Monitor the admin dashboard
3. Adjust agent configuration as needed
4. Train the agent with Chatwoot knowledge base

**Webhook URL for Chatwoot:**
```
https://ai-agent.astralsup.com/webhook/chatwoot
```

**Admin Dashboard URL:**
```
https://ai-agent.astralsup.com/admin/dashboard
```

**Health Check URL:**
```
https://ai-agent.astralsup.com/health
```
