export class CommandOptions {
  verbose = false
  raw = false
  stats = false
  output = ''
  context = ''
  system = ''
  include = ['**/*']
  /** path to the config file */
  config = ''
  /** path to the resolved config file */
  configPath='.'
  root = ''
  dry = false
  tools = []
  additionalTools = []
  logger={}
  
  constructor(options = {}) {
    Object.assign(this, options);
  }
}
