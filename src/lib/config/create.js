import fs from 'fs/promises'
import { join } from 'path'
import { Logger } from '../logger.js'
import { SILK_DIR } from '../constants.js'

const logger = new Logger()

function createConfigContent (config = {}, format = 'mjs') {
  if(format === 'mjs') {
    return `export default ${JSON.stringify(config, null, 2)};`
  }
  return JSON.stringify(config, null, 2)
}

export async function createConfig (config = {}, format = 'mjs') {
  try {
    await fs.mkdir(SILK_DIR, { recursive: true })

    const content = createConfigContent(config, format)
    const path = join(SILK_DIR, `config.${format}`)

    await fs.writeFile(path, content)

    logger.info(`Created ${path}`)
    return path
  } catch (error) {
    throw new Error(`Failed to create configuration: ${error.message}`)
  }
}
