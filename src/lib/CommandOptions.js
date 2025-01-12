export class CommandOptions {
  verbose = false
  raw = false
  stats = false
  output = ''
  /** set context resolving, false is off */
  context = true
  system = ''
  /** glob pattern */
  include = ['**/*']
  /** path to the config file */
  config = ''
  /** path to the resolved config file */
  configPath = ''
  root = ''
  dry = false
  tools = []
  additionalTools = []
  logger = {}

  constructor (options = {}) {
    Object.assign(this, options)
  }
}
