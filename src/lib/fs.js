import { globby } from 'globby'
import fs from 'fs/promises'
import { join, relative } from 'path'
import { File } from './File.js'
import { DEFAULT_IGNORE } from './constants.js'
import { Config } from './config/Config.js'

/**
 * Generates options for globbing files.
 *
 * @param {import('globby').Options} [options={}] - Custom options to override the default settings.
 * @returns {import('globby').Options} The combined glob options.
 */
export function getGlobOptions(options = {}) {
  return {
    gitignore: true,
    cwd: process.cwd(),
    dot: true,
    // deep: 10,
    // ...options,
    ignore: [
      ...DEFAULT_IGNORE,
      ...(options.ignore || [])
    ]
  }
}

async function loadFileContent(path = "") {
  try {
    const content = await fs.readFile(path, 'utf-8')
    return new File({
      path: relative(process.cwd(), path),
      content
    })
  } catch (error) {
    console.warn(`Warning: Could not read file ${path}: ${error.message}`)
    return null
  }
}

/**
 * Return a Set of files from the CWD
 * @param {*} patterns 
 * @param {*} options 
 * @returns 
 */
async function gatherFiles(patterns = [], options) {
  const globs = Array.isArray(patterns) ? patterns : [patterns]
  const globOptions = getGlobOptions(options)
  // Log.debug(`Gathering files with options`, { globs, globOptions })
  const files = await globby(globs, globOptions)
  // Log.debug(files)
  return new Set(files)
}

/**
 * Gather all files in the project with metadata without reading the file content
 * @param {*} patterns 
 * @param {*} config 
 * @returns {Promise<File[]>} files
 */
export async function gatherContextInfo(patterns, config = new Config()) {
  if (!patterns) return []

  try {
    const allFiles = await gatherFiles(patterns, {
      ...config,
      cwd: config.absoluteRoot
    })
    console.log(allFiles)
    // Sort aphabatically so cache matches
    const _files = Array.from(allFiles)
      .toSorted((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))

    const fileInfos = await getFileInfos(_files, process.cwd())
    const files = fileInfos
      .filter(Boolean)
      .filter(file => file !== null)
    return files
  } catch (error) {
    console.warn(`Warning: Error gathering context info: ${error.message}`)
    return []
  }
}

/**
 * Add metadata to files
 * @param {*} files 
 * @param {*} root 
 * @returns 
 */
async function getFileInfos(files = [], root = '') {
  return Promise.all(files.map(path => getFileInfo(path, root)))
}

async function getFileInfo(relPath = '', root = '') {
  const path = join(root, relPath)
  const stats = await fs.stat(path)
  return new File({
    path: relative(root, path),
    size: stats.size,
  })
}

export async function resolveContent(files = [], root = '') {
  return Promise.all(
    files.map(async info => {
      if (!info.content) {
        const file = await loadFileContent(join(root,info.path))
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
