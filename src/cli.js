#!/usr/bin/env node
import { program } from 'commander'
import { run } from './commands/run.js'
import { Chat, chat } from './commands/chat.js'
import { map } from './commands/map.js'
import { init } from './commands/init.js'
import { pack } from './commands/pack.js'
import { info } from './commands/info.js'
import { parse } from './commands/parse.js'
import { login } from './commands/login.js'
import { addSharedOptions } from './options.js'

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version(process.env.npm_package_version)

program
  .command('login')
  .argument('[key]', 'key')
  .description('Configure API key')
  .option('-i, --interactive', 'Interactive mode')
  .action(login)

program
  .command('init')
  .argument('[root]', 'root directory')
  .description('Initialize a new Silk project')
  .action(init)

program
  .command('info')
  // @todo add json option
  .option('--json', 'json')
  .description('Show current configuration')
  .action(info)

program
  .command('parse')
  .alias('p')
  .argument('[file]', 'file to parse')
  .description('Parse markdown file into individual files')
  .action(parse)

program
  .command('pack')
  .argument('<folder>', 'folder to pack')
  .option('-o, --output <file>', 'output file', 'packed.md')
  .description('Pack folder contents into a single markdown file')
  .action(pack)

addSharedOptions(
  program
    .command('create')
    .alias('c')
    .argument('<folder>', 'folder')
    .argument('<prompt>', 'prompt or file')
    .description('Execute a single task')
).action((folder, promptOrFile, options) => {
  run(promptOrFile, {
    root: folder,
    ...options
  })
})

addSharedOptions(
  program
    .command('ask')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a task without additional context')
    .action((promptOrFile, options) => {
      run(promptOrFile, {
        ...options,
        context: '' // Override context to be empty
      })
    })
)

addSharedOptions(
  program
    .command('run')
    .alias('do')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a single task')
).action(run)

addSharedOptions(
  program
    .command('chat')
    .option('-s, --style <file>', 'change the talking style. e.g friendly, brief', '')
    .description('Start interactive chat mode')
    .action(chat)
)

addSharedOptions(
  program
    .command('each')
    .alias('map')
    .argument('[prompt]', 'prompt or file')
    .description('Run a prompt over multiple files')
).action(map)

program.parse()
