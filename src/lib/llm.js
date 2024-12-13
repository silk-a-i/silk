import { getAIClient } from './ai/client.js';
import { Logger } from './logger.js';

export async function executeMessages(messages = [], onProgress, options = {}) {
  if(!messages.length) {
    throw new Error('No messages provided');
  }
  
  const logger = new Logger({ verbose: options.verbose });
  const client = getAIClient();

  try {
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

    return fullContent;
  } catch (error) {
    throw new Error(`LLM execution failed: ${error.message}`);
  }
}

export async function executePrompt(prompt, onProgress, options = {}) {
  const messages = [
    {
      role: 'system',
      content: options.system
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  return executeMessages(messages, onProgress, options);
}
