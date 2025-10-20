import { Request, Response } from 'express';
import { ChatwootWebhook } from '../types';
import messageProcessorService from '../services/message-processor.service';
import logger from '../utils/logger';

export async function handleChatwootWebhook(req: Request, res: Response) {
  try {
    const webhook: ChatwootWebhook = req.body;

    logger.info('Received Chatwoot webhook', {
      event: webhook.event,
      conversationId: webhook.conversation?.id,
      messageId: webhook.id,
    });

    // Respond immediately to Chatwoot
    res.status(200).json({ status: 'received' });

    // Process webhook asynchronously
    // This prevents timeout issues with Chatwoot
    setImmediate(async () => {
      try {
        await messageProcessorService.processWebhook(webhook);
      } catch (error) {
        logger.error('Error in async webhook processing:', error);
      }
    });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function healthCheck(_req: Request, res: Response) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'astral-ai-agent',
  });
}
