import fs from 'fs/promises';
import path from 'path';
import { Logger } from './logger.js';

async function tryReadFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function extractPrompt(promptOrFile) {
  const logger = new Logger();
  
  try {
    // If no prompt given, look for default files
    if (!promptOrFile) {
      const designPath = path.join('.silk', 'design.md');
      const content = await tryReadFile(designPath);
      if (!content) {
        throw new Error('No prompt provided and no .silk/design.md found');
      }
      return content;
    }

    // Check if prompt is a file path
    const content = await tryReadFile(promptOrFile);
    if (content) return content;

    // Check if it's a prompt name in .silk folder
    const silkPath = path.join('.silk', `${promptOrFile}.md`);
    const silkContent = await tryReadFile(silkPath);
    if (silkContent) return silkContent;

    // Treat as direct prompt
    return promptOrFile;

  } catch (error) {
    throw new Error(`Failed to extract prompt: ${error.message}`);
  }
}
