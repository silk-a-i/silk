import ora from 'ora';
import { Task } from '../lib/task.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { gatherContext } from '../lib/utils.js';
import { extractPrompt } from '../lib/prompt-extractor.js';
import { createBasicTools } from '../lib/tools/basicTools.js';
import { FileStats } from '../lib/stats.js';
import { TaskExecutor } from '../lib/TaskExecutor.js';
import { loadConfig } from '../lib/config/load.js';
import fs from 'fs';

export async function doCommand(root, promptOrFile, options = {}) {
  const logger = new Logger({ verbose: options.verbose });
  const spinner = ora('Processing request...').start();
  
  try {
    // Handle case when only prompt is provided
    if (!promptOrFile && root) {
      promptOrFile = root;
      root = null;
    }

    // Load configuration first
    const config = await loadConfig();
    logger.debug(`Using provider: ${config.provider}`);
    logger.debug(`Using model: ${config.model}`);
    logger.debug(`Using root: ${root}`);

    // If root is provided, resolve paths relative to it
    if (root) {
      // Create directory
      fs.mkdirSync(root, { recursive: true });
      process.chdir(root);
    }
    
    // Extract prompt from input or default file
    const prompt = await extractPrompt(promptOrFile);
    
    // Create tools with output directory
    const tools = createBasicTools({ output: options.output });
    
    // Create task with context and tools
    const context = await gatherContext(options.context);
    
    // Calculate context stats if needed
    if (options.stats && context.length > 0) {
      const stats = new FileStats();
      context.forEach(file => stats.addFile(file.path, file.content));
      stats.getSummary(logger);
    }
    
    const task = new Task({
      prompt,
      context,
      system: options.system,
      tools
    });

    // Create and attach renderer
    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: options.stats
    }).attach(task.toolProcessor);
    
    spinner.stop();
    
    // Execute task with config
    const executor = new TaskExecutor(options);
    const result = await executor.execute(task, { ...options, config });
    
    console.log('Task completed');
    // renderer.cleanup();
    return result;

  } catch (error) {
    spinner.fail('Task failed');
    logger.error(error.message);
    throw error;
  }
}
