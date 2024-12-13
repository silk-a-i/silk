import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { Logger } from '../lib/logger.js';
import { File } from '../lib/File.js';

export async function packCommand(folder, options) {
  const logger = new Logger();
  
  try {
    const files = await glob('**/*', { 
      cwd: folder,
      nodir: true,
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        options.output
      ]
    });

    if (files.length === 0) {
      logger.error('No files found to pack');
      process.exit(1);
    }

    let content = `# Packed Files from ${folder}\n\n`;

    for (const filePath of files) {
      const fullPath = path.join(folder, filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const file = new File(filePath, fileContent);
      content += file.render();
    }

    const outputPath = path.resolve(options.output);
    await fs.writeFile(outputPath, content);

    logger.success(`Packed ${files.length} files into ${outputPath}`);
    logger.info(`Files packed:\n${files.map(f => '- ' + f).join('\n')}`);

  } catch (error) {
    logger.error(`Failed to pack folder: ${error.message}`);
    process.exit(1);
  }
}
