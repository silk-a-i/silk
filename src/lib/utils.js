import { glob } from 'glob-gitignore';
import fs from 'fs/promises';
import path from 'path';
import { File } from './File.js';

const DEFAULT_IGNORE = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.git/**',
  'coverage/**',
  'test/**',
  '.silk/**',
  '.silk.json',
  '.silk.md',
  '.env',
  '.DS_Store',
  'yarn.lock',
  'package-lock.json',
  'npm-debug.log',
  'pnpm-lock.yaml',
];

export function getGlobOptions(options = {}) {
  return {
    nodir: true,
    dot: true,
    ...options,
    ignore: [...DEFAULT_IGNORE, ...(options.ignore || [])],
  };
}

async function loadFileContent(filePath) {
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
}

export async function gatherContext(patterns, options = {}) {
  if (!patterns) return [];
  
  try {
    const allFiles = await gatherFiles(patterns, options);
    const fileObjects = await Promise.all(
      Array.from(allFiles).map(loadFileContent)
    );

    return fileObjects.filter(Boolean);
  } catch (error) {
    console.warn(`Warning: Error gathering context: ${error.message}`);
    return [];
  }
}

export async function gatherContextInfo(patterns, options = {}) {
  if (!patterns) return [];
  
  try {
    const allFiles = await gatherFiles(patterns, options);
    const fileInfos = await Promise.all(
      Array.from(allFiles).map(async filePath => {
        try {
          const stats = await fs.stat(filePath);
          return {
            path: path.relative(process.cwd(), filePath),
            size: stats.size
          };
        } catch (error) {
          console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
          return null;
        }
      })
    );

    return fileInfos.filter(Boolean);
  } catch (error) {
    console.warn(`Warning: Error gathering context info: ${error.message}`);
    return [];
  }
}

async function gatherFiles(patterns, options) {
  const globs = Array.isArray(patterns) ? patterns : [patterns];
  const allFiles = new Set();

  const globOptions = getGlobOptions(options);
  const files = await glob(globs, globOptions);
  files.forEach(file => allFiles.add(file));

  return allFiles;
}
