export class CommandOptions {
  verbose = false
  raw = false
  stats = false
  output = ''
  context = ''
  system = ''
  config = {}
  include = ['**/*']
  /** path to the config file */
  configPath='.'
  root = ''
  dry = false
  
  constructor(options = {}) {
    Object.assign(this, options);
  }
}
