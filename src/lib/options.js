import { program } from 'commander';

export function addSharedOptions(command) {
  return command
    .option('-o, --output <dir>', 'Output directory for generated files', '')
    .option('-c, --context [glob]', 'File glob pattern to process')
    .option('-v, --verbose', 'Show additional information including the used prompt', false)
    .option('-r, --raw', 'Show raw LLM output without formatting', false)
    .option('-s, --stats', 'Show stats', false)
}