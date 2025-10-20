/**
 * Script to load Chatwoot knowledge into the database
 * Run with: npm run load-knowledge
 */
import chatwootKnowledgeLoader from '../services/chatwoot-knowledge-loader.service';
import logger from '../utils/logger';

async function main() {
  try {
    logger.info('Starting Chatwoot knowledge loading...');
    await chatwootKnowledgeLoader.loadChatwootKnowledge();
    logger.info('Knowledge loading completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error loading knowledge:', error);
    process.exit(1);
  }
}

main();
