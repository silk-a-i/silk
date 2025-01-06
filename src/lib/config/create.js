import fs from 'fs/promises'
import path from 'path'
import { Logger } from '../logger.js'

const logger = new Logger()

export async function createConfig (config, format = 'js') {
  try {
    await fs.mkdir('.silk', { recursive: true })

    const configPath = path.join('.silk', `config.${format}`)
    const configContent = format === 'js'
      ? `export default ${JSON.stringify(config, null, 2)};`
      : JSON.stringify(config, null, 2)

    await fs.writeFile(configPath, configContent)

    logger.info(`Created ${configPath}`)
    return configPath
  } catch (error) {
    throw new Error(`Failed to create configuration: ${error.message}`)
  }
}
