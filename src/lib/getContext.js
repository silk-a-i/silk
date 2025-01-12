import { gatherContextInfo } from './fs.js'

/**
 * Gets the context files
 * @param {object} config Configuration object
 * @returns {Promise<Array>} Array of context files
 */
export async function getContext(config) {
  const contextInfo = await gatherContextInfo(config.include, config)

  return contextInfo
}

