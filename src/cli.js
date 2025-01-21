#!/usr/bin/env node
import { program } from 'commander'
import { run } from './commands/run.js'
import { chat } from './commands/chat.js'
import { map } from './commands/map.js'
import { init } from './commands/init.js'
import { pack } from './commands/pack.js'
import { info, installInfoCommand } from './commands/info.js'
import { parse } from './commands/parse.js'
import { login } from './commands/login.js'
import { addSharedOptions } from './options.js'
import { create } from './commands/create.js'
import { newCommand } from './commands/new.js'

import "./features.js"

process.on('uncaughtException', function(err) {
  // handle the error safely
  console.error(err.message)
  console.error(err.stack)
})

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version('0.0.1')

program
  .command('login')
  .argument('[key]', 'key')
  .description('Configure API key')
  .option('-i, --interactive', 'Interactive mode')
  .action(login)

program
  .command('init')
  .argument('[root]', 'root directory')
  .option('-y, --yes', 'yes')
  .description('Initialize a new Silk project')
  .action(init)

installInfoCommand(program)

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
    .argument('[prompt]', 'prompt or file')
    .option('-y, --yes', 'yes')
    .description('Create a new project.')
).action(create)

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
    .command('change')
    .argument('[file]', 'source file')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a task on a single file')
    .action((file, promptOrFile = '', options) => {
      run(promptOrFile, {
        ...options,
        context: file // Override context to be empty
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

program
  .command('new')
  .alias('n')
  .argument('[file]', 'file to parse')
  .description('Create a new design file')
  .action(newCommand)

program.parse()
