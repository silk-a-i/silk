export class CommandOptions {
  verbose = false
  raw = false
  stats = false
  output = ''
  context = ''
  system = ''
  config = {}
  include = ['**/*']
  constructor(options = {}) {
    Object.assign(this, options);
  }
}
