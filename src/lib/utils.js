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

async function gatherFiles(patterns, options) {
  const globs = Array.isArray(patterns) ? patterns : [patterns];
  const globOptions = getGlobOptions(options);
  const files = await glob(globs, globOptions);
  return new Set(files);
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
            size: stats.size,
            content: null // Content is loaded on demand
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

export async function resolveContent(fileInfos) {
  return Promise.all(
    fileInfos.map(async info => {
      if (!info.content) {
        const file = await loadFileContent(info.path);
        return file;
      }
      return new File(info.path, info.content);
    })
  );
}

// Remove deprecated function since it's replaced by gatherContextInfo + resolveContent
