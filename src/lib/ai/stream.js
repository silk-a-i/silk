export class AIResponseStream {
  constructor(response) {
    this.reader = response.body.getReader();
    this.decoder = new TextDecoder();
    this.buffer = '';
  }

  async *[Symbol.asyncIterator]() {
    try {
      while (true) {
        const { done, value } = await this.reader.read();
        
        if (done) {
          if (this.buffer) {
            yield this.parseChunk(this.buffer);
          }
          break;
        }

        const chunk = this.decoder.decode(value);
        this.buffer += chunk;
        
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            const content = this.parseChunk(line);
            if (content) {
              yield content;
            }
          }
        }
      }
    } finally {
      this.reader.releaseLock();
    }
  }

  parseChunk(chunk) {
    if (!chunk.startsWith('data: ')) {
      return null;
    }

    const data = chunk.slice(6);
    if (data === '[DONE]') {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content || '';
    } catch (error) {
      return null;
    }
  }
}
