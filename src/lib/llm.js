import { getAIClient } from './ai/client.js';
import { Logger } from './logger.js';

export const SYSTEM_PROMPT = 
`You are a helpful AI assistant that helps with coding tasks. 
Be brief and clear in your requests.

You can use the following tools to perform actions:
- create: Create or update files

Example usage:
<silk.action tool="create" path="index.html">
<div>Hello World</div>
</silk.action>

You can also use file blocks:
##### \`script.js\`
\`\`\`javascript
console.log('Hello');
\`\`\`
`;

export async function executePrompt(prompt, onProgress, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const client = getAIClient();

  try {
    logger.info(`Using model: ${client.config.model}`);
    
    const messages = [
      {
        role: 'system',
        content: options.system || SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: prompt
      }
    ];

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
