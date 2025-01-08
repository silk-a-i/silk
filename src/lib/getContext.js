import { gatherContextInfo, resolveContent } from './fs.js'
import { LimitChecker } from './LimitChecker.js'

/**
 * Gets the context files while applying size limits and skipping binary files
 * @param {object} config Configuration object
 * @returns {Promise<Array>} Array of context files
 */
export async function getContext(config) {
  const limitChecker = new LimitChecker(config)
  const contextInfo = await gatherContextInfo(config.include, config)

  // Filter and validate files
  const validFiles = contextInfo.filter(file => {
    try {
      // Skip binary files
      if (isBinaryPath(file.path)) return false
      
      // Check size limits
      limitChecker.checkFile(file.path, file.size)
      return true
    } catch (error) {
      return false
    }
  })

  return validFiles
}

// Common binary file extensions
const BINARY_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'ico', 'pdf', 
  'zip', 'tar', 'gz', 'exe', 'dll', 'so',
  'mp3', 'mp4', 'avi', 'mov', 'woff', 'woff2'
])

function isBinaryPath(filePath = '') {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}
