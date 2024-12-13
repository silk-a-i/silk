import ora from 'ora';
import { Task } from '../lib/task.js';
import { validatePrompt } from '../lib/validation.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { loadPromptFromFile, isFile, gatherContext } from '../lib/task.js';

export async function doCommand(prompt, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const spinner = ora('Processing request...').start();
  
  try {
    // Create task with context
    const task = new Task({
      prompt: await isFile(prompt) ? await loadPromptFromFile(prompt) : prompt,
      context: await gatherContext(options.context),
      system: options.system
    });
    logger.prompt(task.fullSystem)

    // Create and attach renderer
    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: options.stats
    }).attach(task.toolProcessor);

    // Validate and execute
    const validatedPrompt = validatePrompt(await task.render());
    logger.prompt(validatedPrompt);
    
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
