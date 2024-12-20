import { TaskExecutor } from '../lib/TaskExecutor.js';
import { loadConfig } from '../lib/config/load.js';
import { logConfiguration } from './info.js';
import { gatherContextInfo } from '../lib/utils.js';
import fs from 'fs/promises';
import { File } from '../lib/File.js';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { createBasicTools } from '../lib/tools/basicTools.js';
import { mkdirSync } from 'fs';

export async function mapCommand(promptOrFile, options = {}) {
  const config = await loadConfig({ config: options.config });
  const logger = new Logger(options);

  logConfiguration(config, logger);
  const executor = new TaskExecutor(config);

  const { root } = config;
  console.log({config, options})
  if (root) {
    mkdirSync(root, { recursive: true });
    process.chdir(root);
  }

  const files = await gatherContextInfo(config.include);

  if (files.length === 0) {
    logger.info(`No files found matching pattern: ${config.include}`);
    return;
  }

  logger.info(`Found ${files.length} files to process`);

  for (const fileInfo of files) {
    logger.info(`\nProcessing: ${fileInfo.path}`);
    const content = await fs.readFile(fileInfo.path, 'utf-8');
    const file = new File(fileInfo.path, content);

    if (!options.dry) {
      const task = new Task({
        prompt: `${promptOrFile}\n\nFile to process: ${file.render()}`,
        context: [],
        tools: createBasicTools(options)
      });

      const renderer = new CliRenderer(options).attach(task.toolProcessor);
      await executor.execute(task, { ...options, config });
      renderer.cleanup();
    }
  }
}
