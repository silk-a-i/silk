import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob-gitignore';
import { Logger } from '../lib/logger.js';
import { File } from '../lib/File.js';
import { getGlobOptions } from '../lib/utils.js';
import { FileStats, formatBytes } from '../lib/stats.js';

export async function packCommand(folder, options) {
  const logger = new Logger();
  
  try {
    const globOptions = await getGlobOptions({ 
      cwd: folder,
      ignore: [options.output]
    });
    
    const files = await glob('**/*', globOptions);

    if (files.length === 0) {
      logger.error('No files found to pack');
      process.exit(1);
    }

    let content = `# Packed Files from ${folder}\n\n`;
    const stats = new FileStats();

    for (const filePath of files) {
      const fullPath = path.join(folder, filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      
      stats.addFile(filePath, fileContent);
      const file = new File(filePath, fileContent);
      content += file.render();
    }

    const outputPath = path.resolve(options.output);
    await fs.writeFile(outputPath, content);

    logger.success(`\nPacked ${files.length} files into ${outputPath}`);
    
    // Add output file size to stats summary
    logger.stats('Output', [{
      label: path.basename(outputPath),
      value: formatBytes(Buffer.from(content).length)
    }]);

    stats.getSummary(logger);

  } catch (error) {
    logger.error(`Failed to pack folder: ${error.message}`);
    process.exit(1);
  }
}
