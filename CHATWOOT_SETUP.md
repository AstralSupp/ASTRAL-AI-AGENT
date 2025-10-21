# Chatwoot Setup Guide

## Prerequisites

You need a Chatwoot instance with WhatsApp connected. Options:

### Option A: Chatwoot Cloud (Easiest)
- Go to https://www.chatwoot.com/
- Sign up for cloud plan
- Follow their WhatsApp integration guide

### Option B: Self-Hosted
- Deploy Chatwoot on your own server
- Follow: https://www.chatwoot.com/docs/self-hosted

## Step 1: Get API Access Token

1. Log in to your Chatwoot instance
2. Click on your **Profile** (bottom left) → **Profile Settings**
3. Scroll to **Access Token** section
4. Click **Create new token**
5. Copy the token → Add to `.env` as `CHATWOOT_API_TOKEN`

## Step 2: Get Account ID

1. In Chatwoot, click on **Settings** (gear icon)
2. Look at the URL in your browser
3. The URL will be: `https://your-chatwoot.com/app/accounts/1/settings/...`
4. The number after `/accounts/` is your Account ID (usually `1`)
5. Add to `.env` as `CHATWOOT_ACCOUNT_ID`

## Step 3: Get Inbox ID

### Method 1: From URL
1. Go to **Settings** → **Inboxes**
2. Click on your **WhatsApp inbox**
3. Look at the URL: `https://your-chatwoot.com/app/accounts/1/settings/inboxes/123`
4. The last number is your Inbox ID
5. Add to `.env` as `CHATWOOT_INBOX_ID`

### Method 2: From API
```bash
# Replace with your details:
CHATWOOT_URL="https://your-chatwoot.com"
API_TOKEN="your-api-token"
ACCOUNT_ID="1"

curl -X GET "$CHATWOOT_URL/api/v1/accounts/$ACCOUNT_ID/inboxes" \
  -H "api_access_token: $API_TOKEN"
```

Look for the WhatsApp inbox in the response and get its `id`.

## Step 4: Configure Webhook

1. In Chatwoot, go to **Settings** → **Integrations** → **Webhooks**
2. Click **Add new webhook**
3. Fill in:
   - **URL**: `https://your-deployed-domain.com/webhooks/chatwoot`
     - For local testing with ngrok: `https://xxxx.ngrok.io/webhooks/chatwoot`
   - **Subscribe to events**: Check `message_created`
4. Click **Create**

### Local Testing with ngrok

If you want to test locally first:

```bash
# Install ngrok: https://ngrok.com/download
# Then run:
ngrok http 3000

# Use the https URL provided (e.g., https://abc123.ngrok.io)
# Add to Chatwoot webhook: https://abc123.ngrok.io/webhooks/chatwoot
```

## Step 5: Update .env File

Your `.env` should now have:

```env
CHATWOOT_URL=https://your-chatwoot-instance.com
CHATWOOT_API_TOKEN=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=2
```

## Step 6: Test Configuration

Once everything is configured, test by:

1. Start your agent:
   ```bash
   npm install
   npm run dev
   ```

2. Send a WhatsApp message to your Chatwoot number

3. Check the agent logs - you should see:
   ```
   Received Chatwoot webhook
   Processing message...
   Claude response generated
   Message sent successfully
   ```

4. The response should appear in WhatsApp!

## Troubleshooting

**Webhook not receiving messages?**
- Verify webhook URL is accessible from internet
- Check webhook is subscribed to `message_created` event
- Test webhook endpoint: `curl -X POST https://your-domain.com/health`

**API authentication failing?**
- Verify API token is correct
- Check token has proper permissions
- Try regenerating the token

**Can't find WhatsApp inbox?**
- Ensure WhatsApp is properly connected in Chatwoot
- Check inbox status is "Active"
- Try listing all inboxes via API (see Method 2 above)
