export class AIResponseStream {
  constructor(response, provider) {
    this.reader = response.body.getReader()
    this.decoder = new TextDecoder()
    this.buffer = ''
    this.provider = provider
  }

  async * [Symbol.asyncIterator]() {
    try {
      while (true) {
        const { done, value } = await this.reader.read()
        if (done) break

        const chunk = this.decoder.decode(value)
        const parsedChunks = this.parseChunks(chunk)
        
        for (const parsedChunk of parsedChunks) {
          yield parsedChunk
        }
      }
    } finally {
      this.reader.releaseLock()
    }
  }

  parseChunks(chunk) {
    const lines = (this.buffer + chunk).split('\n')
    this.buffer = lines.pop() || ''

    return lines
      .filter(line => line.startsWith('data: '))
      .map(line => this.parseChunk(line))
      .filter(Boolean)
  }

  parseChunk(chunk) {
    try {
      const data = chunk.slice(6)
      if (data === '[DONE]') return null

      const parsed = JSON.parse(data)
      return this.extractContent(parsed)
    } catch {
      return null
    }
  }

  extractContent(parsed) {
    const extractors = {
      silk: () => parsed || '',
      anthropic: () => parsed.delta?.text || '',
      openai: () => parsed.choices?.[0]?.delta?.content || '',
      ollama: () => parsed.choices?.[0]?.delta?.content || ''
    }

    return extractors[this.provider]?.() || ''
  }
}
