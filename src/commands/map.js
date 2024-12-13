import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { executePrompt } from '../lib/llm.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';

export async function mapCommand(prompt, options) {
  const logger = new Logger({ verbose: options.verbose });
  
  const context = options.context || "*.*";
  try {
    if (!context) {
      logger.error('Error: --context option is required');
      process.exit(1);
    }

    logger.info(context);
    const files = await glob(context, { 
      absolute: true 
    });
    
    if (files.length === 0) {
      logger.info(`No files found matching pattern: ${context}`);
      return;
    }

    logger.info(`Found ${files.length} files to process`);

    for (const filePath of files) {
      const relativePath = path.relative(process.cwd(), filePath);
      logger.info(`\nProcessing: ${relativePath}`);

      const content = await fs.readFile(filePath, 'utf-8');
      const contextPrompt = `
File: ${relativePath}
Content:
\`\`\`
${content}
\`\`\`

Task: ${prompt}

Please provide the complete transformed file content.`;

      logger.prompt(contextPrompt);

      const renderer = new CliRenderer({ 
        raw: options.raw,
        showStats: true
      });
      
      await executePrompt(
        contextPrompt, 
        (chunk) => renderer.render(chunk),
        { 
          ...options
          // output: options.output || path.dirname(filePath) 
        }
      );

      renderer.cleanup();
    }

    logger.success('\nAll files processed successfully');

  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}