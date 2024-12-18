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

  constructor(options = {}) {
    Object.assign(this, options);
  }
}
