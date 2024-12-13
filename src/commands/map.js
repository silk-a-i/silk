import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';

export async function mapCommand(prompt, options) {
  const logger = new Logger({ verbose: options.verbose });
  
  try {
    if (!options.context) {
      logger.error('Error: --context option is required');
      process.exit(1);
    }

    const files = await glob(options.context, { 
      absolute: true 
    });
    
    if (files.length === 0) {
      logger.info(`No files found matching pattern: ${options.context}`);
      return;
    }

    logger.info(`Found ${files.length} files to process`);

    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: true
    });

    for (const filePath of files) {
      const relativePath = path.relative(process.cwd(), filePath);
      logger.info(`\nProcessing: ${relativePath}`);

      const content = await fs.readFile(filePath, 'utf-8');
      const task = new Task({
        prompt: `${prompt}\n\nFile to process: ${relativePath}`,
        context: [{ path: relativePath, content }],
        system: options.system
      });

      renderer.attach(task.toolProcessor);

      await task.execute({ 
        ...options,
        output: options.output || path.dirname(filePath)
      });
    }

    renderer.cleanup();
    logger.success('\nAll files processed successfully');

  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}
