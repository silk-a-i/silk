import fs from 'fs/promises';
import path from 'path';
import { Logger } from './logger.js';

export async function extractPrompt(promptOrFile) {
  const logger = new Logger();
  
  try {
    // If no prompt given, look for default design file
    if (!promptOrFile) {
      const defaultPath = path.join('.silk', 'design.md');
      try {
        return await fs.readFile(defaultPath, 'utf-8');
      } catch (error) {
        throw new Error('No prompt provided and no .silk/design.md found');
      }
    }

    // Check if the prompt is a file path
    try {
      const stats = await fs.stat(promptOrFile);
      if (stats.isFile()) {
        return await fs.readFile(promptOrFile, 'utf-8');
      }
    } catch {
      // Not a file, treat as direct prompt
      return promptOrFile;
    }

    return promptOrFile;
  } catch (error) {
    logger.error(`Failed to extract prompt: ${error.message}`);
    process.exit(1);
  }
}
