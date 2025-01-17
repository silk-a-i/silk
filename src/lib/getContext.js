import { gatherContextInfo } from './fs.js'
import { CONTEXT_MODES } from './config/Config.js'

/**
 * Gets the context files based on the configured context mode
 * @param {object} config Configuration object
 * @returns {Promise<Array>} Array of context files
 */
export async function getContext(config) {
  if (config.contextMode === CONTEXT_MODES.NONE) {
    return []
  }

  // Else return the full context info
  const contextInfo = await gatherContextInfo(config.include, config)
  return contextInfo
}
