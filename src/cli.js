#!/usr/bin/env node
import { program } from 'commander';
import { doCommand } from './commands/do.js';
import { patchCommand } from './commands/patch.js';
import { chatCommand } from './commands/chat.js';
import { mapCommand } from './commands/map.js';
import { initCommand } from './commands/init.js';
import { prepCommand } from './commands/prep.js';
import { packCommand } from './commands/pack.js';
import { createCommand } from './commands/create.js';
import { addSharedOptions } from './lib/options.js';

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version(process.env.npm_package_version);

program
  .command('init')
  .description('Initialize a new Silk project')
  .action(initCommand);

program
  .command('create')
  .argument('[root]', 'root directory')
  .argument('[prompt]', 'prompt or file')
  .option('-f, --format <format>', 'output format (md/json)', 'md')
  .description('Create a prompt without executing it')
  .action(createCommand);

program
  .command('prep')
  .argument('<folder>', 'folder to prepare')
  .description('Create a package of files')
  .action(prepCommand);

program
  .command('pack')
  .argument('<folder>', 'folder to pack')
  .option('-o, --output <file>', 'output file', 'packed.md')
  .description('Pack folder contents into a single markdown file')
  .action(packCommand);

addSharedOptions(
  program
    .command('do')
    .argument('[root]', 'root directory')
    .argument('[prompt]', 'prompt or file')
    .alias('create')
    .description('Execute a single task')
).action(doCommand);

addSharedOptions(
  program
    .command('patch')
    .argument('[root]', 'root directory')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a task with current directory as output and all files as context')
).action(patchCommand);

program
  .command('chat')
  .argument('[root]', 'root directory')
  .description('Start interactive chat mode')
  .action(chatCommand);

addSharedOptions(
  program
    .command('map')
    .argument('[root]', 'root directory')
    .argument('[prompt]', 'prompt or file')
    .description('Run a prompt over multiple files')
).action(mapCommand);

program.parse();
