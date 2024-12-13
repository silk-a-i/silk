import { getAIClient } from './ai/client.js';
import { ActionProcessor } from './processors/action.js';
import { Logger } from './logger.js';

export const SYSTEM_PROMPT = 
`You are a helpful AI assistant that helps with coding tasks. 
Be brief and clear in your requests. 
> IMPORTANT Always return the full file content in the response.
> IMPORTANT available actions are: 'create'
> IMPORTANT always use the <action> and </action> tag.

Examples:
<action do="create" file="index.html">
<div>Hello World</div>
</action>

`;

export async function executePrompt(prompt, onProgress, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const client = getAIClient();

  try {
    // Log model info
    logger.info(`Using model: ${client.config.model}`);
    
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const stream = await client.createCompletion({ messages });
    const processor = new ActionProcessor(options);
    
    let fullContent = '';
    
    for await (const chunk of stream) {
      if (chunk) {
        fullContent += chunk;
        await processor.process(chunk);
        
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
