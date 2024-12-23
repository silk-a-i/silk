export class Tool {
  name = ''
  description = ''
  pattern = null
  examples = []
  onStart() {}
  onProgress() {}
  onFinish() {}

  constructor(obj) {
    Object.assign(this, obj)
  }

  get system() {
return `## ${this.name}
${this.description}
Examples:
${this.examples.join('\n')}`
  }
}
