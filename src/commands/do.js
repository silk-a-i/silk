import ora from 'ora';
import { executePrompt } from '../lib/llm.js';
import { validatePrompt } from '../lib/validation.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { Task, loadPromptFromFile, isFile, gatherContext } from '../lib/task.js';

export async function doCommand(prompt, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const spinner = ora('Processing request...').start();
  
  try {
    // Create task with context
    const task = new Task({
      prompt: await isFile(prompt) ? await loadPromptFromFile(prompt) : prompt,
      context: await gatherContext(options.context),
      // Add system prompt from options if provided
      system: options.system
    });

    // Render full prompt with context
    const fullPrompt = await task.render();
    const validatedPrompt = validatePrompt(fullPrompt);
    logger.prompt(validatedPrompt);
    
    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: options.stats
    });
    
    spinner.stop();
    
    const result = await executePrompt(
      validatedPrompt, 
      (chunk) => renderer.render(chunk),
      options
    );

    renderer.cleanup();
    task.completed = true;
    
    return result;
  } catch (error) {
    spinner.fail('Task failed');
    logger.error(error.message);
    throw error; // Re-throw to allow proper error handling in todo command
  }
}
