import path from 'path';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { extractPrompt } from '../lib/prompt-extractor.js';
import { createBasicTools } from '../lib/tools/basicTools.js';
import { gatherContextInfo, resolveContent } from '../lib/utils.js';

export async function mapCommand(root, promptOrFile, options) {
  const logger = new Logger({ verbose: options.verbose });
  
  try {
    // Handle case when only prompt is provided
    if (!promptOrFile && root) {
      promptOrFile = root;
      root = null;
    }

    // If root is provided, change working directory
    if (root) {
      process.chdir(root);
      options.output = options.output ? path.join(root, options.output) : root;
    }

    // Extract prompt from input or default file
    const prompt = await extractPrompt(promptOrFile);
    
    if (!options.context) {
      logger.error('Error: --context option is required');
      process.exit(1);
    }

    const contextInfo = await gatherContextInfo(options.context);
    const files = await resolveContent(contextInfo);
    
    if (files.length === 0) {
      logger.info(`No files found matching pattern: ${options.context}`);
      return;
    }

    logger.info(`Found ${files.length} files to process`);

    const renderer = new CliRenderer({ 
      raw: options.raw,
      showStats: true
    });

    for (const file of files) {
      logger.info(`\nProcessing: ${file.path}`);
      
      const outputDir = options.output || path.dirname(file.path);
      const tools = createBasicTools({ output: outputDir });
      
      const task = new Task({
        prompt: `${prompt}\n\nFile to process: ${file.path}`,
        context: [file],
        system: options.system,
        tools
      });

      renderer.attach(task.toolProcessor);
      await task.execute(options);
    }

    renderer.cleanup();
    logger.success('\nAll files processed successfully');

  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}
