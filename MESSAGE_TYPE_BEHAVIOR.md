# Message Type Behavior

## Overview

The ASTRAL AI Agent automatically matches response types to input types:

- **Text message** → **Text response** 💬
- **Audio message** → **Audio response** 🎤

This creates a natural, human-like conversation experience.

---

## How It Works

### Text Messages

```
┌─────────────────────────────────────────┐
│ Customer: "Olá, preciso de ajuda"       │
│ (WhatsApp text message)                 │
└─────────────────────────────────────────┘
                  ↓
          ┌───────────────┐
          │ Chatwoot      │
          │ Webhook       │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Message Type: │
          │ TEXT          │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Claude AI     │
          │ Generates     │
          │ Response      │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Shows         │
          │ TYPING        │
          │ indicator ⌨️  │
          └───────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Agent: "Olá! Como posso ajudar você?"  │
│ (Text response)                         │
└─────────────────────────────────────────┘
```

### Audio Messages

```
┌─────────────────────────────────────────┐
│ Customer: [Voice message] 🎤            │
│ (WhatsApp audio)                        │
└─────────────────────────────────────────┘
                  ↓
          ┌───────────────┐
          │ Chatwoot      │
          │ Webhook       │
          │ (audio URL)   │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ OpenAI        │
          │ Whisper       │
          │ Transcribes   │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Message Type: │
          │ AUDIO         │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Claude AI     │
          │ Generates     │
          │ Response      │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ Shows         │
          │ RECORDING     │
          │ indicator 🔴  │
          └───────────────┘
                  ↓
          ┌───────────────┐
          │ ElevenLabs    │
          │ Converts to   │
          │ Portuguese    │
          │ Speech        │
          └───────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Agent: [Voice message] 🎤               │
│ (Audio response in Portuguese)          │
└─────────────────────────────────────────┘
```

---

## Code Implementation

### Detection (message-processor.service.ts)

```typescript
// Line 69-76: Detect audio and transcribe
if (webhook.content_type === 'audio' && webhook.content_attributes?.file_url) {
  logger.info('Transcribing audio message');
  messageContent = await openaiService.transcribeAudio(
    webhook.content_attributes.file_url
  );
}

// Line 169: Pass audio flag to response handler
await this.handleResponse(
  conversationId,
  messageContent,
  context.messages,
  decision,
  webhook.content_type === 'audio'  // ← Audio detection
);
```

### Response Matching

```typescript
// Line 235: Match response type to input
const sendAsAudio = isAudioInput || decision.response_type === 'audio';

// Line 257-261: Send appropriate response
if (sendAsAudio) {
  await this.sendAudioResponse(conversationId, response);
} else {
  await this.sendTextResponse(conversationId, response);
}
```

---

## Indicators

The agent shows appropriate indicators based on response type:

### Text Response
- Shows: **Typing indicator** (⌨️)
- Duration: Based on message length and typing speed
- Default: 50 characters per second
- Max: 10 seconds

### Audio Response
- Shows: **Recording indicator** (🔴)
- Duration: Based on estimated speech length
- Calculation: ~2 seconds per sentence
- Max: 10 seconds

---

## Configuration

Adjust timing in `.env`:

```env
# Typing speed for text messages (characters per second)
TYPING_SPEED_CPS=50

# Maximum indicator duration (milliseconds)
MAX_TYPING_INDICATOR_MS=10000
```

---

## Examples

### Example 1: Text Conversation
```
Customer: "Quanto custa o produto?"
   ↓ (text)
Agent: "O produto custa R$ 99,90. Posso ajudar com mais alguma coisa?"
   ↑ (text with typing indicator)
```

### Example 2: Audio Conversation
```
Customer: [🎤 "Olá, gostaria de saber sobre entrega"]
   ↓ (audio)
   ↓ Whisper transcribes
Agent: [🎤 "Olá! Fazemos entregas para todo o Brasil..."]
   ↑ (audio with recording indicator in Portuguese)
```

### Example 3: Mixed (stays consistent)
```
Customer: "Qual o horário?" (text)
   ↓
Agent: "Funcionamos das 9h às 18h" (text)

Customer: [🎤 "E no sábado?"]
   ↓
Agent: [🎤 "Aos sábados das 9h às 13h"] (audio)

Customer: "Obrigado!" (text)
   ↓
Agent: "De nada! 😊" (text)
```

---

## Benefits

✅ **Natural Conversation**: Matches customer's preferred communication style

✅ **Accessibility**: Supports customers who prefer audio (e.g., while driving)

✅ **Efficiency**: Text for quick info, audio for detailed explanations

✅ **Human-like**: People naturally respond in the same format they receive

✅ **Portuguese Voice**: Native Brazilian Portuguese pronunciation with ElevenLabs

---

## Technical Details

### Audio Processing Pipeline

**Incoming Audio**:
1. WhatsApp → Chatwoot (audio file URL)
2. Download audio file
3. OpenAI Whisper API transcription (Portuguese)
4. Process as text through Claude
5. Generate text response

**Outgoing Audio**:
1. Text response from Claude
2. ElevenLabs Text-to-Speech API
3. Voice ID: `yoiZfrc4wQ9Rs1QGpnm5` (Portuguese)
4. Generate MP3 audio
5. Upload to Chatwoot
6. Chatwoot → WhatsApp (audio message)

### Text Processing Pipeline

**Incoming Text**:
1. WhatsApp → Chatwoot (text content)
2. Process through Claude
3. Generate text response

**Outgoing Text**:
1. Text response from Claude
2. Send directly to Chatwoot
3. Chatwoot → WhatsApp (text message)

---

## Logs

When processing messages, you'll see:

**Text Message**:
```
[INFO] Processing webhook: message_type=incoming, content_type=text
[INFO] Agent decision: action=respond, response_type=text
[INFO] Showing typing indicator
[INFO] Message sent successfully: type=text
```

**Audio Message**:
```
[INFO] Processing webhook: message_type=incoming, content_type=audio
[INFO] Transcribing audio message
[INFO] Audio transcribed: "Olá, preciso de ajuda"
[INFO] Agent decision: action=respond, response_type=audio
[INFO] Showing recording indicator
[INFO] Converting text to speech with ElevenLabs
[INFO] Audio message sent successfully: type=audio
```

---

This behavior is **built-in and automatic** - no configuration needed! 🎉
