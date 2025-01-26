import { Chat } from '../lib/chat/chat.js'
import { addSharedOptions, CommandOptions } from '../options.js'

export async function chat(options = new CommandOptions()) {
  // @todo Detect if is a project first
  
  const chat = new Chat(options)
  await chat.init()
}

export function installChat(program) {
  addSharedOptions(
    program
      .command('chat')
      .option('-s, --style <file>', 'change the talking style. e.g friendly, brief', '')
      .description('Start interactive chat mode')
      .action(chat)
  )
}