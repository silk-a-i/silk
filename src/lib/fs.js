import { globby } from 'globby'
import fs from 'fs/promises'
import { join, relative } from 'path'
import { File } from './File.js'
import { DEFAULT_IGNORE } from './constants.js'
import { Log } from './logger.js'

/**
 * Generates options for globbing files.
 *
 * @param {import('globby').Options} [options={}] - Custom options to override the default settings.
 * @returns {import('globby').Options} The combined glob options.
 */
export function getGlobOptions (options = {}) {
  return {
    gitignore: true,
    dot: true,
    // deep: 10,
    // ...options,
    ignore: [
      ...DEFAULT_IGNORE,
      ...(options.ignore || [])
    ]
  }
}

async function loadFileContent (filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return new File({
      path: relative(process.cwd(), filePath),
      content
    })
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`)
    return null
  }
}

async function gatherFiles (patterns = [], options) {
  const globs = Array.isArray(patterns) ? patterns : [patterns]
  const globOptions = getGlobOptions(options)
  Log.debug(`Gathering files with options`, {globs, globOptions})
  const files = await globby(globs, globOptions)
  Log.debug(files)
  return new Set(files)
}

/**
 * Gather all files in the project with metadata
 * @param {*} patterns 
 * @param {*} options 
 * @returns {Promise<File[]>} files
 */
export async function gatherContextInfo(patterns, options = {}) {
  if (!patterns) return []

  const { cwd = '' } = options
  try {
    const allFiles = await gatherFiles(patterns, options)
    const fileInfos = await getFileInfos(Array.from(allFiles), cwd)
    const files = fileInfos
      .filter(Boolean)
      // Sort aphabatically so cache matches
      .toSorted((a, b) => a.path.toLocaleLowerCase().localeCompare(b.path.toLocaleLowerCase()))
    return files
  } catch (error) {
    console.warn(`Warning: Error gathering context info: ${error.message}`)
    return []
  }
}

async function getFileInfos(files = [], cwd) {
  return Promise.all(files.map(path => getFileInfo(path, cwd)))
}

async function getFileInfo(relPath = '', cwd = '') {
  console.log(path)
  const path = join(cwd, relPath)
  try {
    const stats = await fs.stat(path)
    return new File({
      path: relative(cwd, path),
      size: stats.size,
    })
  } catch (error) {
    console.warn(`Warning: Could not read file ${path}: ${error.message}`)
    return null
  }
}

export async function resolveContent (fileInfos) {
  return Promise.all(
    fileInfos.map(async info => {
      if (!info.content) {
        const file = await loadFileContent(info.path)
        return file
      }
      const file = new File({
        path: info.path,
        content: info.content
      })
      return file
    })
  )
}

// Common binary file extensions
export const BINARY_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'ico', 'pdf', 
  'zip', 'tar', 'gz', 'exe', 'dll', 'so',
  'mp3', 'mp4', 'avi', 'mov', 'woff', 'woff2'
])

export function isBinaryPath(filePath = '') {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}