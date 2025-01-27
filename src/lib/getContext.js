import { gatherContextInfo } from './fs.js'
import { Config, CONTEXT_MODES } from './config/Config.js'
import { generateJson } from './silk.js'
import { createAutoscopeMessages, mapPathsToContext } from './scoping/autoscope.js'

/**
 * Gets the context files based on the configured context mode
 * @param {object} config Configuration object
 * @returns {Promise<Array>} Array of context files
 */
export async function getContext(config = new Config, { prompt = '', on = (type, payload) => { } } = {}) {
  if (config.contextMode === CONTEXT_MODES.NONE) {
    return []
  }

  if (config.contextMode === CONTEXT_MODES.AUTO) {
    if (!prompt) {
      throw new Error('Prompt is required for auto context mode')
    }

    const files = await gatherContextInfo(config.include, config)
    on('context', files)
    if (files.length === 0) {
      return []
    }

    const messages = createAutoscopeMessages({ prompt, files }) || []
    on('messages', messages)

    const {json, text} = await generateJson({
      config,
      messages,
    })
    on('text', text)
    
    // console.log({json, files})
    const selectedFiles = mapPathsToContext(json, files)
    const toFiles = selectedFiles.map(({ file }) => file)
    // console.log({ selectedFiles, toFiles })
    return toFiles
  }

  // Else return the full context info
  const contextInfo = await gatherContextInfo(config.include, config)
  return contextInfo
}

// [ [ 'docs/configuration.md' ] ]