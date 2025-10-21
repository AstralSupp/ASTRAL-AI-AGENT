# ASTRAL AI Agent

An intelligent WhatsApp AI agent built with Chatwoot, Claude AI, OpenAI Whisper, and ElevenLabs for customer service and sales automation.

## Features

- **Multi-Channel Support**: Handles WhatsApp messages through Chatwoot
- **Human-Like Behavior**:
  - Thinks before every action
  - Shows typing/recording indicators based on message length
  - Waits for customers to finish sending multiple messages
  - Smart emoji reactions (selective, not on every message)
- **Intelligent Communication**:
  - Text-to-text responses
  - Audio-to-audio responses
  - Speech-to-text with OpenAI Whisper
  - Text-to-speech with ElevenLabs (Portuguese support)
- **AI-Powered**:
  - Claude AI for intelligent decision-making and responses
  - Contextual awareness with conversation history
  - Built-in knowledge about Chatwoot
  - Customer service and sales capabilities
- **Brazilian Business Ready**:
  - Portuguese (Brazil) language support
  - Brazilian business context
  - Cultural awareness in responses

## Architecture

```
┌─────────────┐
│  WhatsApp   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Chatwoot   │
└──────┬──────┘
       │ (Webhook)
       ▼
┌─────────────────────────────────────┐
│         ASTRAL AI Agent             │
│  ┌────────────────────────────────┐ │
│  │   Message Processor            │ │
│  │   - Burst Detection            │ │
│  │   - Decision Engine            │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌──────────┐  ┌────────────────┐  │
│  │ Claude   │  │ OpenAI Whisper │  │
│  │   AI     │  │  (Speech2Text) │  │
│  └──────────┘  └────────────────┘  │
│                                     │
│  ┌──────────┐  ┌────────────────┐  │
│  │ElevenLabs│  │   Supabase     │  │
│  │(Text2Speech) │  (Database)   │  │
│  └──────────┘  └────────────────┘  │
└─────────────────────────────────────┘
```

## Prerequisites

- Node.js 18 or higher
- Supabase account (database)
- Chatwoot instance with WhatsApp configured
- Anthropic API key (Claude)
- OpenAI API key (Whisper)
- ElevenLabs API key (Portuguese voice)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AstralSupp/ASTRAL-AI-AGENT.git
cd ASTRAL-AI-AGENT
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Chatwoot
CHATWOOT_URL=https://your-chatwoot.com
CHATWOOT_API_TOKEN=your-api-token
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...

# Business Config
AGENT_NAME=Astral
BUSINESS_NAME=Sua Empresa
BUSINESS_DESCRIPTION=Descrição do seu negócio
BUSINESS_LANGUAGE=pt-BR
```

### 4. Set up Database (Optional for Docker Compose)

**For Docker Compose (Coolify, local):** Database auto-initializes on first run! No manual setup needed.

**For manual Supabase setup:** Run the migration in your Supabase SQL editor:

```bash
cat database/init/001_initial_schema.sql
```

Copy and execute the SQL in your Supabase project.

### 5. Load Chatwoot knowledge

```bash
npm run load-knowledge
```

### 6. Configure Chatwoot webhook

In your Chatwoot instance:

1. Go to Settings → Integrations → Webhooks
2. Create a new webhook with URL: `https://your-domain.com/webhooks/chatwoot`
3. Subscribe to: `message_created`
4. Save the webhook

## Running

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Docker Deployment

### Build and run with Docker

```bash
docker build -t astral-ai-agent .
docker run -p 3000:3000 --env-file .env astral-ai-agent
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Coolify Deployment

**Quick Start (5 minutes):** See [COOLIFY_QUICKSTART.md](./COOLIFY_QUICKSTART.md)

**Full Guide:** See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)

### TL;DR

1. Create new Docker Compose resource in Coolify
2. Connect repository: `https://github.com/AstralSupp/ASTRAL-AI-AGENT`
3. Set domain: `ai-agent.astralsup.com` (or your domain)
4. Add environment variables (see `.env.coolify.example`)
5. Deploy!

The service will be available at the domain configured in Coolify with auto-provisioned SSL.

## Configuration

### Agent Behavior

Adjust these environment variables to customize agent behavior:

- `MESSAGE_BURST_DELAY_MS` (default: 3000): How long to wait for more messages
- `TYPING_SPEED_CPS` (default: 50): Characters per second for typing indicator
- `MAX_TYPING_INDICATOR_MS` (default: 10000): Maximum typing indicator duration

### ElevenLabs Voice

To get a Portuguese voice ID:

1. Go to ElevenLabs.io
2. Browse voices or create a custom voice
3. Select a Portuguese (Brazil) voice
4. Copy the Voice ID to `ELEVENLABS_VOICE_ID`

Recommended voices:
- "Matheus" (male, Brazilian Portuguese)
- "Camila" (female, Brazilian Portuguese)

## How It Works

### Message Flow

1. **Customer sends message** → WhatsApp → Chatwoot
2. **Chatwoot webhook** → ASTRAL AI Agent
3. **Message Burst Detection**:
   - Agent waits 3 seconds to see if more messages arrive
   - Detects when customer finishes typing
4. **AI Decision Making**:
   - Claude analyzes context and decides: respond, wait, or react
   - Determines if response should be text or audio
5. **Response Generation**:
   - Claude generates appropriate response
   - If audio input → audio output (via ElevenLabs)
   - If text input → text output (with option for audio)
6. **Human-Like Behavior**:
   - Shows typing/recording indicator
   - Duration based on message length
   - Adds emoji reactions strategically
7. **Send Response** → Chatwoot → WhatsApp → Customer

### Smart Features

**Message Burst Detection**:
```
Customer: Oi                      [Wait...]
Customer: Tudo bem?              [Wait...]
Customer: Preciso de ajuda       [Complete! Process now]
```

**Emoji Reactions**:
```
Customer: "Muito obrigado!"      → 🙏 (reacts)
Customer: "ok"                   → (no reaction)
Customer: "Perfeito!"            → ✨ (reacts)
```

**Audio Intelligence**:
```
Customer: [Sends voice message]  → Transcribed with Whisper
Agent: [Decides to respond]      → Sends voice response via ElevenLabs
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T10:30:00.000Z",
  "service": "astral-ai-agent"
}
```

### Chatwoot Webhook

```http
POST /webhooks/chatwoot
```

This endpoint receives webhook events from Chatwoot.

## Database Schema

The agent uses Supabase with the following tables:

- **conversations**: Stores conversation metadata
- **messages**: All messages with full history
- **message_bursts**: Tracks message bursts for smart waiting
- **agent_decisions**: Logs all AI decisions for analysis
- **chatwoot_knowledge**: Chatwoot product knowledge base

## Monitoring

### Logs

The agent uses Pino for structured logging:

```bash
# View logs in development (pretty-printed)
npm run dev

# View logs in production (JSON)
docker logs -f astral-ai-agent
```

### Health Checks

The Docker container includes health checks:

```bash
docker ps  # Check STATUS column
```

## Troubleshooting

### Agent not responding

1. Check webhook configuration in Chatwoot
2. Verify environment variables are set correctly
3. Check logs for errors: `docker logs astral-ai-agent`
4. Test health endpoint: `curl http://localhost:3000/health`

### Audio messages not working

1. Verify OpenAI API key has Whisper access
2. Check ElevenLabs API key and voice ID
3. Ensure Chatwoot is sending audio file URLs in webhook

### Typing indicators not showing

1. Check Chatwoot API token permissions
2. Verify `toggleTypingStatus` API endpoint is available in your Chatwoot version
3. Check network connectivity to Chatwoot

## Development

### Project Structure

```
ASTRAL-AI-AGENT/
├── src/
│   ├── config/              # Configuration
│   ├── controllers/         # HTTP controllers
│   ├── middleware/          # Express middleware
│   ├── prompts/            # AI prompts
│   ├── services/           # Business logic
│   │   ├── chatwoot.service.ts
│   │   ├── claude.service.ts
│   │   ├── elevenlabs.service.ts
│   │   ├── openai.service.ts
│   │   ├── message-processor.service.ts
│   │   ├── message-burst.service.ts
│   │   └── supabase.service.ts
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilities
│   ├── views/              # EJS templates (admin dashboard)
│   └── index.ts            # Entry point
├── database/
│   └── init/               # Auto-run database migrations
├── Dockerfile
├── docker-compose.yml
├── COOLIFY_DEPLOYMENT.md   # Coolify deployment guide
├── COOLIFY_QUICKSTART.md   # 5-minute quick start
└── README.md
```

### Adding New Features

1. Create service in `src/services/`
2. Add types in `src/types/index.ts`
3. Update message processor to use new service
4. Test thoroughly before deploying

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check Chatwoot documentation: https://www.chatwoot.com/docs
- Check Claude API docs: https://docs.anthropic.com

## Acknowledgments

- Built with [Chatwoot](https://www.chatwoot.com)
- Powered by [Claude AI](https://www.anthropic.com)
- Speech-to-text by [OpenAI Whisper](https://openai.com/research/whisper)
- Text-to-speech by [ElevenLabs](https://elevenlabs.io)
- Database by [Supabase](https://supabase.com)

---

Made with ❤️ for Brazilian businesses
