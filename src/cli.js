#!/usr/bin/env node
import { program } from 'commander';
import { doCommand } from './commands/do.js';
import { chatCommand } from './commands/chat.js';
import { mapCommand } from './commands/map.js';
import { initCommand } from './commands/init.js';
import { prepCommand } from './commands/prep.js';
import { packCommand } from './commands/pack.js';
import { infoCommand } from './commands/info.js';
import { parseCommand } from './commands/parse.js';
import { addSharedOptions } from './lib/options.js';

program
  .name('silk')
  .description('CLI tool for quick task automation using LLMs')
  .version(process.env.npm_package_version);

program
  .command('init')
  .argument('[root]', 'root directory')
  .description('Initialize a new Silk project')
  .action(initCommand);

program
  .command('info')
  .description('Show current configuration')
  .action(infoCommand);

program
  .command('parse')
  .argument('[file]', 'file to parse')
  .description('Parse markdown file into individual files')
  .action(parseCommand);

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
    .command('run')
    .alias('patch')
    .alias('do')
    .alias('build')
    .alias('create')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a single task')
).action(doCommand);

addSharedOptions(
  program
    .command('prompt')
    .argument('[prompt]', 'prompt or file')
    .description('Execute a single task')
).action(function(prompt, options) {
  doCommand('.', prompt, options);
})

addSharedOptions(
  program
    .command('chat')
    .description('Start interactive chat mode')
    .action(chatCommand)
)

addSharedOptions(
  program
    .command('each')
    .alias('map')
    .argument('[prompt]', 'prompt or file')
    .description('Run a prompt over multiple files')
).action(mapCommand);

program.parse();
