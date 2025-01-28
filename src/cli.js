#!/usr/bin/env node
import { program } from 'commander'
import { installRun } from './commands/run.js'
import { installChat } from './commands/chat.js'
import { installMap, map } from './commands/map.js'
import { installInit } from './commands/init.js'
import { installPack } from './commands/pack.js'
import { installInfoCommand } from './commands/info.js'
import { installParse } from './commands/parse.js'
import { installLogin } from './commands/login.js'
import { installCreate } from './commands/create.js'
import { installNew } from './commands/new.js'
import "./features.js"
import { installConfigCommand } from './commands/config.js'
import { uncaughtException } from './uncaught.js'

process.on('uncaughtException', uncaughtException)

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version('0.0.1')

installLogin(program)

installInit(program)

installInfoCommand(program)

installParse(program)

installPack(program)

installCreate(program)

installRun(program)

installChat(program)

installMap(program)

installNew(program)

installConfigCommand(program)

program.parse()
