import path from 'path';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { gatherContext } from '../lib/utils.js';
import { extractPrompt } from '../lib/prompt-extractor.js';
import { createBasicTools } from '../lib/tools/basicTools.js';

export async function createCommand(root, promptOrFile, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  
  try {
    // Handle case when only prompt is provided
    if (!promptOrFile && root) {
      promptOrFile = root;
      root = null;
    }

    // If root is provided, resolve paths relative to it
    if (root) {
      process.chdir(root);
    }
    
    // Extract prompt from input or default file
    const prompt = await extractPrompt(promptOrFile);
    
    // Create tools with output directory
    const tools = createBasicTools({ output: options.output });
    
    // Create task with context and tools
    const context = await gatherContext(options.context || '**/*');
    
    const task = new Task({
      prompt,
      context,
      system: options.system,
      tools
    });

    // Generate the full prompt
    const messages = [
      {
        role: 'system',
        content: task.fullSystem
      },
      {
        role: 'user',
        content: task.render()
      }
    ];

    // Output based on format
    if (options.format === 'json') {
      console.log(JSON.stringify({
        messages,
        metadata: {
          contextFiles: context.length,
          prompt: {
            length: prompt.length,
            type: promptOrFile === prompt ? 'direct' : 'file'
          }
        }
      }, null, 2));
    } else {
      // Default markdown format
      console.log(`# System Prompt\n\n${task.fullSystem}\n`);
      console.log(`# User Prompt\n\n${task.render()}`);
    }

  } catch (error) {
    logger.error(`Failed to create prompt: ${error.message}`);
    process.exit(1);
  }
}
