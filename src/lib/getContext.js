import { gatherContextInfo } from './fs.js'
import { Config, CONTEXT_MODES } from './config/Config.js'
import { getSilkFromConfig } from './silk.js'
import { autoscope } from './scoping/autoscope.js'

/**
 * Gets the context files based on the configured context mode
 * @param {object} config Configuration object
 * @returns {Promise<Array>} Array of context files
 */
export async function getContext(config = new Config, {prompt} = {prompt: ''}) {
  if (config.contextMode === CONTEXT_MODES.NONE) {
    return []
  }

  if(config.contextMode === CONTEXT_MODES.AUTO) {
    if(!prompt) {
      throw new Error('Prompt is required for auto context mode')
    }
    
    const files = await gatherContextInfo(config.include, config)    

    if(files.length === 0) {
      return []
    }
    const {llm} = getSilkFromConfig(config)
    const selectedFiles = await autoscope({files, prompt, llm})
    return selectedFiles.map(({file}) => file)
  }

  // Else return the full context info
  const contextInfo = await gatherContextInfo(config.include, config)
  return contextInfo
}
