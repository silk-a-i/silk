import { Chat } from '../lib/chat/chat.js'
import { CommandOptions } from '../lib/CommandOptions.js'

export async function chat(options = new CommandOptions()) {
  const chat = new Chat(options)
  await chat.init()
}
