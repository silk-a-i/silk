import ora from 'ora';
import path from 'path';
import { Task } from '../lib/task.js';
import { validatePrompt } from '../lib/validation.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { gatherContext } from '../lib/utils.js';
import { extractPrompt } from '../lib/prompt-extractor.js';
import { createBasicTools } from '../lib/tools/basicTools.js';

export async function doCommand(root, promptOrFile, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const spinner = ora('Processing request...').start();
  
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
    const context = await gatherContext(options.context)
    
    const task = new Task({
      prompt,
      context,
      system: options.system,
      tools
    });

    // Log messages instead of prompt
    const messages = [
      {
        role: 'system',
        content: task.fullSystem
      },
      {
        role: 'user',
        content: await task.render()
      }
    ];
    
    logger.messages(messages);

    // Create and attach renderer
    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: options.stats
    }).attach(task.toolProcessor);
    
    spinner.stop();
    
    const result = await task.execute(options);
    
    renderer.cleanup();
    return result;

  } catch (error) {
    spinner.fail('Task failed');
    logger.error(error.message);
    throw error;
  }
}
