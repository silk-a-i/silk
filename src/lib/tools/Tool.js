import { EventEmitter } from 'events';
export class Tool extends EventEmitter {
  _isTool = true
  name = ''
  description = ''
  /** @type {string|string[]} */
  examples = ''
  onStart() { }
  onProgress() {}
  onFinish(action, ctx) { }

  constructor(obj) {
    super()
    Object.assign(this, obj)
    this.on('start', this.onStart)
    this.on('finish', this.onFinish)
    this.on('progress', this.onProgress)
  }

  fromFunction(resp, parent) {
    Object.assign(this, resp)
    resp.setup && resp.setup(this, parent)
    return this
  }

  get system() {
    // If examples is array join
    const _examples = Array.isArray(this.examples) ? this.examples.join('\n') : this.examples
return `## ${this.name}
${this.description}
Examples:
${_examples}`
  }
}
