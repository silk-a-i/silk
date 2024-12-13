import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { File } from './File.js';

export async function loadPromptFromFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read prompt file: ${error.message}`);
  }
}

export async function isFile(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function gatherContext(contextGlob, options = {}) {
  if (!contextGlob) return [];
  
  try {
    const files = await glob(contextGlob, {
      ignore: [
        'node_modules/**', 'dist/**', 'build/**', 
        'coverage/**', 'test/**', ".silk/**", ".silk.json", ".silk.md",
        '.env', '.gitignore', '.DS_Store', 'yarn.lock', 'package-lock.json',
        ...options.ignore || []
      ],
      ...options
    });

    const fileObjects = await Promise.all(
      files.map(async filePath => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return new File(
            path.relative(process.cwd(), filePath),
            content
          );
        } catch (error) {
          console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
          return null;
        }
      })
    );

    return fileObjects.filter(Boolean);
  } catch (error) {
    console.warn(`Warning: Error gathering context: ${error.message}`);
    return [];
  }
}
