import { AIClient } from './ai/client.js';
import { Logger } from './logger.js';

export async function executeMessages(messages = [], onProgress, options = {}) {
  if(!messages.length) {
    throw new Error('No messages provided');
  }
  
  const logger = new Logger({ verbose: options.verbose });
  const client = new AIClient(options);

  logger.info(`Using model: ${client.config.model}`);
  logger.messages(messages);
  
  const stream = await client.createCompletion({ messages });
  let fullContent = '';
  
  for await (const chunk of stream) {
    if (chunk) {
      fullContent += chunk;
      if (onProgress) {
        onProgress(chunk);
      }
    }
  }

  onProgress("\n");

  return fullContent;
}
