export class Tool {
  name = '';
  description = '';
  pattern = null;
  onStart = () => {};
  onProgress = () => {};
  onFinish = () => {};

  constructor(obj) {
    Object.assign(this, obj);
  }

  matches(content) {
    return this.pattern.test(content);
  }

  getDescription() {
    return `${this.name} - ${this.description}`;
  }
}
