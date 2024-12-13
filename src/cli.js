#!/usr/bin/env node
import { program } from 'commander';
import { doCommand } from './commands/do.js';
import { patchCommand } from './commands/patch.js';
import { chatCommand } from './commands/chat.js';
import { mapCommand } from './commands/map.js';
import { initCommand } from './commands/init.js';
import { addSharedOptions } from './lib/options.js';

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version(process.env.npm_package_version);

program
  .command('init')
  .description('Initialize a new Silk project')
  .action(initCommand);

addSharedOptions(
  program
    .command('do')
    .argument('<prompt>', 'prompt or file')
    .alias('create')
    .description('Execute a single task')
).action(doCommand);

addSharedOptions(
  program
    .command('patch')
    .argument('<prompt>', 'prompt or file')
    .description('Execute a task with current directory as output and all files as context')
).action(patchCommand);

program
  .command('chat')
  .description('Start interactive chat mode')
  .action(chatCommand);

addSharedOptions(
  program
    .command('map')
    .argument('<prompt>', 'prompt or file')
    .description('Run a prompt over multiple files')
).action(mapCommand);

program.parse();
