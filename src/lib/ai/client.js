import { AIResponseStream } from './stream.js'
import { PROVIDERS } from '../constants.js'

export class AIClient {
  /** max duration in ms */
  timeout = 60 * 1000

  constructor(config) {
    if (!config) throw new Error('Config required')
    this.config = config
  }

  async createCompletion({ messages }) {
    const { config } = this
    const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)
    if (!provider) throw new Error(`Invalid provider: ${config.provider}`)

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    }

    if (provider.value === 'anthropic') headers['anthropic-version'] = '2023-06-01'

    const body = this.formatRequestBody(messages, provider)

    const url = `${config.api.baseUrl}${config.api.endpoint}`
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        console.log(`POST ${url}`, headers)
        throw new Error(`AI request failed (${response.status}): ${(await response.text()).slice(0, 500)}`)
      }
      return new AIResponseStream(response, provider.value)
    } catch (error) {
      /** @note can't check error.code as it is undefined */
      // const isRefused = error.code === 'ECONNREFUSED'
      throw new Error(`Connection refused: ${url}. ${error.message}`)
    }
  }

  formatRequestBody(messages, provider) {
    const base = {
      model: this.config.model,
      stream: true,
      temperature: this.config.temperature || 0,
      max_tokens: this.config.max_tokens || 2 * 1024
    }

    switch (provider.value) {
      case 'anthropic':
        const system = messages.find(m => m.role === 'system')?.content || ''
        const lastUser = messages.filter(m => m.role === 'user').pop()
        return { ...base, messages: [{ role: 'user', content: lastUser.content }], system }

      case 'openai':
        return { ...base, messages }

      default: // ollama
        return { ...base, messages }
    }
  }
}
