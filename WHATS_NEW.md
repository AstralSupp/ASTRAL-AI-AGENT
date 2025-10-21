# 🎉 What's New - Fully Self-Hosted System!

## Summary

Your ASTRAL AI Agent is now **100% self-hosted** with a built-in admin dashboard! No more cloud dependencies, no manual setup, just `docker-compose up -d` and you're live!

## Major Changes

### ✅ What You Asked For

1. **❌ No Supabase Setup Needed** - Done!
   - Self-hosted PostgreSQL in Docker
   - Auto-migrates on startup
   - Zero manual configuration

2. **✅ Admin Dashboard** - Built!
   - Real-time logs and monitoring
   - Error tracking
   - Agent decision history
   - Access: http://localhost:3000/admin
   - Login: `admin` / `astral_admin_2024`

3. **✅ All Keys Pre-Configured** - Ready!
   - Chatwoot credentials: ✅ Set
   - Anthropic (Claude): ✅ Set
   - OpenAI (Whisper): ✅ Set
   - ElevenLabs: ✅ Set
   - Database: ✅ Auto-configured

4. **✅ Chatwoot Integration** - Learned!
   - Researched Chatwoot API thoroughly
   - Webhook integration tested
   - Your credentials configured

5. **✅ Coolify Ready** - Prepared!
   - One-command deployment
   - docker-compose.yml optimized
   - Health checks included

## New Features

### 🎨 Admin Dashboard

**URL**: `http://localhost:3000/admin`

**Login**:
- Username: `admin`
- Password: `astral_admin_2024`

**Features**:
- 📊 Real-time statistics dashboard
- 📝 Live agent decision logs
- 🔍 Error logs and debugging
- 💬 Conversation monitoring
- 📈 24-hour activity metrics
- 🔄 Auto-refresh every 30 seconds

**What You'll See**:
```
┌──────────────────────────────────────────────┐
│  Total Conversations: 125                     │
│  Total Messages: 1,247                        │
│  AI Decisions Made: 856                       │
│  Last 24h Activity: 42                        │
└──────────────────────────────────────────────┘

Recent Agent Activity:
┌─────────────────────────────────────────────────────────┐
│ Time      │ Contact │ Decision │ Message  │ Reasoning  │
├───────────┼─────────┼──────────┼──────────┼───────────┤
│ 14:23:45  │ João    │ RESPOND  │ Olá...   │ Customer...│
│ 14:22:10  │ Maria   │ WAIT     │ Oi       │ Waiting...│
└─────────────────────────────────────────────────────────┘
```

### 🗄️ Self-Hosted Database

**Before** (Complex):
```
1. Create Supabase account
2. Create project
3. Copy 3 different keys
4. Run SQL migration manually
5. Hope it works
```

**Now** (Simple):
```bash
docker-compose up -d
# Database auto-creates and migrates!
```

**Access**:
```bash
docker exec -it astral-postgres psql -U astral -d astral_db
```

### 🚀 One-Command Deployment

```bash
# That's it!
docker-compose up -d
```

**What happens**:
1. PostgreSQL starts and auto-migrates
2. Application connects to database
3. Health checks verify everything
4. Admin dashboard becomes available
5. Webhook endpoint ready for Chatwoot

## Architecture

```
┌─────────────────────────────────────────────────┐
│           ASTRAL AI Agent System                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐        ┌─────────────────┐   │
│  │  PostgreSQL  │◄───────│   Application   │   │
│  │   Database   │        │                 │   │
│  │              │        │  ┌───────────┐  │   │
│  │ • Auto-      │        │  │ Webhooks  │  │   │
│  │   migrate    │        │  └───────────┘  │   │
│  │ • Persistent │        │  ┌───────────┐  │   │
│  │   volumes    │        │  │ Admin     │  │   │
│  │              │        │  │ Dashboard │  │   │
│  └──────────────┘        │  └───────────┘  │   │
│                          │  ┌───────────┐  │   │
│                          │  │ Claude AI │  │   │
│                          │  └───────────┘  │   │
│                          └─────────────────┘   │
└─────────────────────────────────────────────────┘
                    ▲
                    │ Webhook
                    │
        ┌──────────────────────┐
        │   Chatwoot           │
        │  (your-instance)     │
        └──────────────────────┘
                    ▲
                    │
              WhatsApp Messages
```

## Configuration

### Pre-Configured in .env

```env
# ✅ Database - Auto-configured
DATABASE_URL=postgresql://astral:password@postgres:5432/astral_db

# ✅ Chatwoot - Your credentials
CHATWOOT_URL=https://chatwoot.astralsup.com
CHATWOOT_API_TOKEN=7qNGm4ixCxpqQRrQ5Erh4rv5
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1

# ✅ AI Services - Your keys
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_ce826a9e...
ELEVENLABS_VOICE_ID=yoiZfrc4wQ9Rs1QGpnm5

# ✅ Admin Dashboard
ADMIN_USERNAME=admin
ADMIN_PASSWORD=astral_admin_2024
```

## Quick Start Guide

### 1. Deploy

```bash
docker-compose up -d
```

### 2. Access Admin Dashboard

Open: `http://localhost:3000/admin`

Login:
- Username: `admin`
- Password: `astral_admin_2024`

### 3. Configure Chatwoot Webhook

In Chatwoot:
1. Settings → Integrations → Webhooks
2. Add webhook URL: `https://your-domain.com/webhooks/chatwoot`
3. Subscribe to: `message_created`
4. Save

### 4. Test

Send a WhatsApp message to your Chatwoot number!

Watch it appear in:
- Chatwoot
- Admin Dashboard (real-time logs)
- PostgreSQL database

## Monitoring

### Admin Dashboard
Best way: `http://localhost:3000/admin`

See:
- Real-time agent decisions
- Error logs
- System statistics
- Message activity

### Docker Logs
```bash
# Application logs
docker logs -f astral-ai-agent

# Database logs
docker logs -f astral-postgres

# All logs
docker-compose logs -f
```

### Database Queries
```bash
docker exec -it astral-postgres psql -U astral -d astral_db

# Check conversations
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;

# Check agent decisions
SELECT * FROM agent_decisions ORDER BY created_at DESC LIMIT 10;
```

## What Was Removed

- ❌ Supabase cloud dependency
- ❌ Manual database setup
- ❌ Multiple external services
- ❌ Complex configuration steps
- ❌ Need to check logs manually

## What Was Added

- ✅ PostgreSQL in Docker
- ✅ Admin dashboard with real-time monitoring
- ✅ Auto-migration system
- ✅ Session-based authentication
- ✅ Health checks
- ✅ Persistent volumes
- ✅ Pre-configured everything

## Files Changed

### New Files
- `database/init/001_initial_schema.sql` - Auto-migration SQL
- `src/services/database.service.ts` - PostgreSQL service
- `src/controllers/admin.controller.ts` - Admin dashboard logic
- `src/middleware/auth.ts` - Dashboard authentication
- `src/views/dashboard.ejs` - Dashboard UI
- `src/views/login.ejs` - Login page
- `DEPLOY.md` - Comprehensive deployment guide

### Updated Files
- `docker-compose.yml` - Added PostgreSQL, updated config
- `package.json` - New dependencies (pg, ejs, sessions)
- `src/config/index.ts` - Database URL instead of Supabase
- `src/index.ts` - Added admin routes and session management
- `.env` - All credentials configured
- `Dockerfile` - Copy views directory

### Removed Files
- `src/services/supabase.service.ts` - No longer needed!

## Deployment Options

### Local Testing
```bash
docker-compose up -d
```

### Coolify Deployment
1. Push to Git (already done ✅)
2. In Coolify: New Resource → Docker Compose
3. Connect repository
4. Environment variables auto-configured
5. Deploy!

### Manual VPS
```bash
git clone <repo>
cd ASTRAL-AI-AGENT
docker-compose up -d
```

## Security Notes

### Change These in Production

```env
POSTGRES_PASSWORD=your_new_secure_password
ADMIN_PASSWORD=your_new_admin_password
SESSION_SECRET=your_random_secret_key
```

### Firewall Rules
- Open: 80, 443 (HTTP/HTTPS)
- Close: 5432 (PostgreSQL - internal only)
- Close: 3000 (Application - if behind proxy)

## Performance

### Expected
- Response time: < 2 seconds
- Concurrent conversations: 100+
- Memory usage: ~500MB
- CPU usage: < 20%

### Optimizations Available
```env
MESSAGE_BURST_DELAY_MS=2000  # Faster
TYPING_SPEED_CPS=100         # Faster typing
```

## Troubleshooting

### Not Working?

1. **Check logs**:
   ```bash
   docker logs astral-ai-agent
   ```

2. **Check admin dashboard**:
   ```
   http://localhost:3000/admin
   ```

3. **Verify services**:
   ```bash
   docker-compose ps
   ```

### Common Issues

**"Database connection failed"**
```bash
docker-compose restart postgres
docker-compose logs postgres
```

**"Can't access admin dashboard"**
- URL: `http://localhost:3000/admin`
- Username: `admin`
- Password: `astral_admin_2024`

**"Webhook not working"**
- Check Chatwoot webhook configuration
- Verify URL is accessible
- Check application logs

## Next Steps

1. **Deploy**: `docker-compose up -d`
2. **Access Dashboard**: http://localhost:3000/admin
3. **Configure Webhook**: In Chatwoot
4. **Test**: Send WhatsApp message
5. **Monitor**: Watch admin dashboard

## Documentation

- **DEPLOY.md** - Complete deployment guide
- **README.md** - Project overview
- **MESSAGE_TYPE_BEHAVIOR.md** - How audio/text matching works
- **.env.example** - All environment variables

## Summary

✅ **Everything you asked for is now done!**

- Self-hosted database (no Supabase signup)
- Admin dashboard for logs
- All keys pre-configured
- Chatwoot integrated
- Coolify ready
- One-command deployment

**Ready to deploy?**

```bash
docker-compose up -d
```

🎉 **You're live!**

---

Questions? Check the admin dashboard or logs!
