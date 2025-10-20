/**
 * Calculate typing duration based on message length
 * Simulates human typing speed
 */
export function calculateTypingDuration(text: string, cps: number, maxDuration: number): number {
  const characters = text.length;
  const duration = (characters / cps) * 1000; // Convert to milliseconds
  return Math.min(duration, maxDuration);
}

/**
 * Calculate recording duration based on audio/message length
 */
export function calculateRecordingDuration(textLength: number, maxDuration: number): number {
  // Estimate ~2 seconds per sentence (rough approximation)
  const sentences = textLength / 100; // Assume ~100 chars per sentence
  const duration = sentences * 2000;
  return Math.min(duration, maxDuration);
}

/**
 * Sleep for a given duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a message is likely the last in a burst
 * Returns true if the message content suggests completion
 */
export function isMessageLikelyComplete(content: string): boolean {
  const completionIndicators = [
    /[.!?]$/,
    /obrigad[oa]/i,
    /ok$/i,
    /valeu/i,
    /tá bom/i,
    /beleza/i,
    /entendi/i,
    /aguardo/i,
  ];

  return completionIndicators.some((pattern) => pattern.test(content.trim()));
}

/**
 * Detect if customer is asking a question
 */
export function isQuestion(content: string): boolean {
  return /\?/.test(content) || /^(como|quando|onde|porque|qual|quem|o que|quanto)/i.test(content);
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Extract meaningful content from message
 */
export function extractMeaningfulContent(content: string): string {
  return content.trim().replace(/\s+/g, ' ');
}

/**
 * Determine if emoji reaction is appropriate
 */
export function shouldConsiderEmojiReaction(content: string): boolean {
  const reactionTriggers = [
    /obrigad[oa]/i,
    /parabéns/i,
    /legal/i,
    /ótimo/i,
    /perfeito/i,
    /excelente/i,
    /top/i,
    /show/i,
    /😊|😃|😄|❤️|👍/,
  ];

  return reactionTriggers.some((pattern) => pattern.test(content));
}

/**
 * Generate a random delay to simulate human behavior
 */
export function getHumanLikeDelay(baseDelay: number): number {
  // Add randomness: -20% to +30% of base delay
  const variance = baseDelay * (Math.random() * 0.5 - 0.2);
  return Math.max(500, baseDelay + variance);
}
